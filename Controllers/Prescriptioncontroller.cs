using System.Text.Json;
using HEALTHCARE.Data;
using HEALTHCARE.Dtos;
using HEALTHCARE.Models;
using HEALTHCARE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HEALTHCARE.Controllers
{
    [ApiController]
    [Route("api")]
    [Authorize]
    public class PrescriptionController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly PrescriptionPdfService _pdfService;

        public PrescriptionController(AppDbContext db, PrescriptionPdfService pdfService)
        {
            _db = db;
            _pdfService = pdfService;
        }

        private int CurrentUserId()
        {
            return int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        }

        // Appointment.DoctorId points at Doctor.Id, not AppUser.Id — resolve via UserId.
        private async Task<int?> CurrentDoctorId()
        {
            var userId = CurrentUserId();

            var doctor = await _db.Doctors
                .FirstOrDefaultAsync(d => d.UserId == userId);

            return doctor?.Id;
        }

        // ───────────────────────── DOCTOR: create or update ─────────────────────────

        [HttpPost("doctor/prescriptions")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> CreateOrUpdate([FromBody] CreatePrescriptionDto dto)
        {
            var appointment = await _db.Appointments
                .FirstOrDefaultAsync(a => a.Id == dto.AppointmentId);

            if (appointment == null)
                return NotFound(new { message = "Appointment not found." });

            var doctorId = await CurrentDoctorId();

            if (doctorId == null)
                return BadRequest(new { message = "Doctor not found." });

            if (appointment.DoctorId != doctorId)
                return Forbid();

            if (appointment.Status != "Completed")
                return BadRequest(new
                {
                    message = "Prescriptions can only be added for completed appointments."
                });

            if (string.IsNullOrWhiteSpace(dto.Diagnosis))
                return BadRequest(new { message = "Diagnosis is required." });

            if (dto.Medicines == null || dto.Medicines.Count == 0)
                return BadRequest(new { message = "Add at least one medicine." });

            var medicinesJson = JsonSerializer.Serialize(dto.Medicines);

            var existing = await _db.Prescriptions
                .FirstOrDefaultAsync(p => p.AppointmentId == dto.AppointmentId);

            if (existing != null)
            {
                existing.Diagnosis = dto.Diagnosis;
                existing.MedicinesJson = medicinesJson;
                existing.Notes = dto.Notes;
                existing.AdviceOnFollowUp = dto.AdviceOnFollowUp;
                existing.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                _db.Prescriptions.Add(new Prescription
                {
                    AppointmentId = dto.AppointmentId,
                    DoctorId = doctorId.Value,
                    PatientId = appointment.PatientId,
                    Diagnosis = dto.Diagnosis,
                    MedicinesJson = medicinesJson,
                    Notes = dto.Notes,
                    AdviceOnFollowUp = dto.AdviceOnFollowUp
                });
            }
            try
            {
                await _db.SaveChangesAsync();
                return Ok(new
                {
                    message = "Prescription saved successfully."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    error = ex.Message,
                    inner = ex.InnerException?.Message
                });
            }
        }

        // ───────────────────────── SHARED: fetch details as JSON ─────────────────────────
        [HttpGet("prescriptions/appointment/{appointmentId}")]
        public async Task<IActionResult> GetByAppointment(int appointmentId)
        {
            var rx = await BuildResponseDto(appointmentId);
            if (rx == null) return NotFound(new { message = "No prescription found for this appointment." });
            if (!await UserCanAccess(appointmentId)) return Forbid();
            return Ok(rx);
        }

        // ───────────────────────── PATIENT: download branded PDF ─────────────────────────
        [HttpGet("patient/prescriptions/{appointmentId}/pdf")]
        [Authorize(Roles = "Patient")]
        public async Task<IActionResult> DownloadPdf(int appointmentId)
        {
            if (!await UserCanAccess(appointmentId)) return Forbid();
            var rx = await BuildResponseDto(appointmentId);
            if (rx == null) return NotFound(new { message = "No prescription found for this appointment." });
            var pdfBytes = _pdfService.Generate(rx);
            var fileName = $"CareConnect_Prescription_{rx.PatientName.Replace(" ", "_")}_{rx.AppointmentDate:yyyyMMdd}.pdf";
            return File(pdfBytes, "application/pdf", fileName);
        }

        // ───────────────────────── helpers ─────────────────────────
        private async Task<bool> UserCanAccess(int appointmentId)
        {
            var appointment = await _db.Appointments.FirstOrDefaultAsync(a => a.Id == appointmentId);
            if (appointment == null) return false;
            var userId = CurrentUserId();
            var isPatient = User.IsInRole("Patient") && appointment.PatientId == userId;
            var isAdmin = User.IsInRole("Admin");
            var isDoctor = false;
            if (User.IsInRole("Doctor"))
            {
                var doctorId = await CurrentDoctorId();
                isDoctor = doctorId != null && appointment.DoctorId == doctorId;
            }

            return isPatient || isDoctor || isAdmin;
        }

        private async Task<PrescriptionResponseDto?> BuildResponseDto(int appointmentId)
        {
            var rx = await _db.Prescriptions
                .FirstOrDefaultAsync(p => p.AppointmentId == appointmentId);
            if (rx == null) return null;
            var appointment = await _db.Appointments
                .Include(a => a.Doctor).ThenInclude(d => d.User)
                .Include(a => a.Patient)
                .Include(a => a.DoctorAvailability)
                .FirstOrDefaultAsync(a => a.Id == appointmentId);
            if (appointment == null) return null;
            var medicines = JsonSerializer.Deserialize<List<MedicineItemDto>>(rx.MedicinesJson) ?? new();
            var slot = appointment.DoctorAvailability?.AvailableFrom ?? appointment.BookedAt;

            return new PrescriptionResponseDto
            {
                Id = rx.Id,
                AppointmentId = rx.AppointmentId,
                Diagnosis = rx.Diagnosis,
                Medicines = medicines,
                Notes = rx.Notes,
                AdviceOnFollowUp = rx.AdviceOnFollowUp,
                CreatedAt = rx.CreatedAt,

                // Doctor
                DoctorName = appointment.Doctor?.User?.FullName ?? appointment.Doctor?.name ?? "N/A",
                DoctorSpecialization = appointment.Doctor?.Specialization ?? "",
                HospitalName = appointment.Doctor?.HospitalName ?? "N/A",
                PlaceToVisit = appointment.DoctorAvailability?.Place ?? "",
                DoctorEmail = appointment.Doctor?.User?.Email ?? "",
                DoctorPhone = appointment.Doctor?.Phone ?? "",
                Qualification = appointment.Doctor?.Qualification ?? "",
                Experience = appointment.Doctor?.Experience ?? "",

                // Patient
                PatientName = appointment.PatientName,
                PatientPhone = appointment.PatientPhone,
                PatientEmail = appointment.PatientEmail,
                PatientDob = appointment.PatientDob,
                PatientAddress = appointment.Address,
                Gender = appointment.Gender,
                BloodGroup = appointment.BloodGroup,
                Address = appointment.Address,
                // Appointment
                AppointmentDate = slot,
                AppointmentTime = slot.ToString("hh:mm tt")
            };
        }
    }
}