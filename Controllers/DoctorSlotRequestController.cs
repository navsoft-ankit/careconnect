using System.Security.Claims;
using HEALTHCARE.Data;
using HEALTHCARE.DTOs;
using HEALTHCARE.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HEALTHCARE.Controllers;

[ApiController]
[Route("api/doctor")]
[Authorize(Roles = "Doctor")]
public class DoctorSlotRequestController : ControllerBase
{
    private readonly AppDbContext _context;

    public DoctorSlotRequestController(AppDbContext context)
    {
        _context = context;
    }

    // ==========================
    // CREATE SLOT REQUEST
    // ==========================

    [HttpPost("request-slot")]
    public IActionResult RequestSlot(CreateDoctorSlotRequestDto dto)
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var doctor = _context.Doctors
            .FirstOrDefault(x => x.UserId == userId);

        if (doctor == null)
            return NotFound("Doctor not found.");

        var hospital = _context.Hospitals
            .FirstOrDefault(x => x.Id == dto.HospitalId);

        if (hospital == null)
            return NotFound("Hospital not found.");

        var session = _context.HospitalSessions
            .FirstOrDefault(x =>
                x.Id == dto.HospitalSessionId &&
                x.HospitalId == dto.HospitalId &&
                x.IsActive);

        if (session == null)
            return BadRequest("Hospital session not found.");

        // Request must be inside admin session
        var startTime = TimeOnly.FromDateTime(dto.RequestedFrom);
        var endTime = TimeOnly.FromDateTime(dto.RequestedTo);

        if (startTime < session.StartTime ||
            endTime > session.EndTime)
        {
            return BadRequest(
                "Requested time is outside hospital session.");
        }

        // Overlap check with existing pending/approved requests
        var overlap = _context.DoctorSlotRequests.Any(x =>
            x.DoctorId == doctor.Id &&
            x.Status != "Rejected" &&
            dto.RequestedFrom < x.RequestedTo &&
            dto.RequestedTo > x.RequestedFrom);

        if (overlap)
            return BadRequest("Time slot overlaps another request.");

        var request = new DoctorSlotRequest
        {
            DoctorId = doctor.Id,
            HospitalId = dto.HospitalId,
            HospitalSessionId = dto.HospitalSessionId,
            RequestedFrom = dto.RequestedFrom,
            RequestedTo = dto.RequestedTo,
            MaxPatients = dto.MaxPatients,
            Reason = dto.Reason,
            Status = "Pending",
            AvailabilityCreated = false,
            RequestedAt = DateTime.Now
        };

        _context.DoctorSlotRequests.Add(request);

        _context.SaveChanges();

        return Ok(new
        {
            Message = "Slot request submitted successfully."
        });
    }

    // ==========================
    // MY REQUESTS
    // ==========================

    [HttpGet("slot-requests")]
    public IActionResult MyRequests()
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var doctor = _context.Doctors
            .FirstOrDefault(x => x.UserId == userId);

        if (doctor == null)
            return NotFound();

        var data = _context.DoctorSlotRequests
            .Include(x => x.Hospital)
            .Include(x => x.HospitalSession)
            .Where(x => x.DoctorId == doctor.Id)
            .OrderByDescending(x => x.RequestedAt)
            .Select(x => new
            {
                x.Id,
                Hospital = x.Hospital!.Name,
                x.RequestedFrom,
                x.RequestedTo,
                x.MaxPatients,
                x.Reason,
                x.Status,
                x.AdminRemark,
                x.AvailabilityCreated,
                x.RequestedAt
            })
                        .ToList();

        return Ok(data);
    }

    // ==========================
    // CANCEL REQUEST
    // ==========================

    [HttpDelete("slot-request/{id}")]
    public IActionResult CancelRequest(int id)
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var doctor = _context.Doctors
            .FirstOrDefault(x => x.UserId == userId);

        if (doctor == null)
            return NotFound();

        var request = _context.DoctorSlotRequests
            .FirstOrDefault(x =>
                x.Id == id &&
                x.DoctorId == doctor.Id);

        if (request == null)
            return NotFound();

        if (request.Status == "Approved")
            return BadRequest(
                "Approved request cannot be deleted.");

        _context.DoctorSlotRequests.Remove(request);

        _context.SaveChanges();

        return Ok("Deleted successfully.");
    }
}