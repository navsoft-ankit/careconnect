using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HEALTHCARE.Data;
using HEALTHCARE.DTOs;
using HEALTHCARE.Models;

namespace HEALTHCARE.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Doctor")]
public class DoctorController : ControllerBase
{
    private readonly AppDbContext _context;

    public DoctorController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("availability")]
    public IActionResult AddAvailability(CreateAvailabilityDto dto)
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var doctor = _context.Doctors
            .FirstOrDefault(x => x.UserId == userId);

        if (doctor == null)
            return NotFound("Doctor not found");

        var availability = new DoctorAvailability
        {
            DoctorId = doctor.Id,
            AvailableFrom = dto.AvailableFrom,
            AvailableTo = dto.AvailableTo
        };

        _context.DoctorAvailabilities.Add(availability);
        _context.SaveChanges();

        return Ok("Availability added");
    }

    [HttpGet("availability")]
    public IActionResult GetAvailability()
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var doctor = _context.Doctors
            .FirstOrDefault(x => x.UserId == userId);

        if (doctor == null)
            return NotFound();

        var data = _context.DoctorAvailabilities
            .Where(x => x.DoctorId == doctor.Id)
            .OrderBy(x => x.AvailableFrom)
            .ToList();

        return Ok(data);
    }

    [HttpGet("appointments")]
    public IActionResult GetAppointments()
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var doctor = _context.Doctors
            .FirstOrDefault(x => x.UserId == userId);

        if (doctor == null)
            return NotFound();

        var appointments = (
            from a in _context.Appointments
            join u in _context.Users
                on a.PatientId equals u.Id
            where a.DoctorId == doctor.Id
            orderby a.BookedAt descending
            select new
            {
                a.Id,
                PatientName = u.FullName,
                PatientEmail = u.Email,
                a.BookedAt,
                a.Status,
                a.DoctorAvailabilityId
            }
        ).ToList();

        return Ok(appointments);
    }

    [HttpPut("appointment/status")]
    public IActionResult UpdateAppointmentStatus(UpdateAppointmentStatusDto dto)
    {
        var appointment = _context.Appointments
            .FirstOrDefault(x => x.Id == dto.AppointmentId);

        if (appointment == null)
            return NotFound();

        appointment.Status = dto.Status;

        _context.SaveChanges();

        return Ok("Status updated");
    }
}