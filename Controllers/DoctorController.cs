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
        Console.WriteLine($"UserId = {userId}");
        Console.WriteLine($"DoctorId = {doctor?.Id}");

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
        var count = _context.Appointments.Count(a => a.DoctorId == doctor.Id);
        Console.WriteLine($"Appointment Count = {count}");

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
                Status = a.Status,

                Date = a.DoctorAvailability.AvailableFrom.Date,

                Time = a.DoctorAvailability.AvailableFrom.ToString("hh:mm tt"),

                BookedAt = a.BookedAt
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

    [HttpGet("profile")]
    public IActionResult GetProfile()
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var doctor = _context.Doctors
            .Where(d => d.UserId == userId)
            .Select(d => new
            {
                d.Id,
                d.UserId,
                Name = d.User.FullName,
                Email = d.User.Email,
                d.Specialization,
                d.HospitalName,
                d.Fee,
                d.About
            })
            .FirstOrDefault();

        if (doctor == null)
            return NotFound("Doctor not found");

        return Ok(doctor);
    }
    [HttpGet("dashboard")]
    public IActionResult Dashboard()
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var doctor = _context.Doctors
            .FirstOrDefault(x => x.UserId == userId);

        if (doctor == null)
            return NotFound();

        var appointments = _context.Appointments
            .Where(x => x.DoctorId == doctor.Id);

        return Ok(new
        {
            TotalAppointments = appointments.Count(),
            Confirmed = appointments.Count(x => x.Status == "Confirmed"),
            Pending = appointments.Count(x => x.Status == "Pending"),
            Cancelled = appointments.Count(x =>
                x.Status == "CancelledByAdmin" ||
                x.Status == "CancelledByUser")
        });
    }
    [HttpPut("availability")]
    public IActionResult UpdateAvailability(UpdateAvailabilityDto dto)
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var doctor = _context.Doctors
            .FirstOrDefault(x => x.UserId == userId);

        if (doctor == null)
            return NotFound("Doctor not found");

        var availability = _context.DoctorAvailabilities
            .FirstOrDefault(x => x.Id == dto.Id &&
                                 x.DoctorId == doctor.Id);

        if (availability == null)
            return NotFound("Availability not found");

        if (availability.IsBooked)
            return BadRequest("Booked slot cannot be edited.");

        availability.AvailableFrom = dto.AvailableFrom;
        availability.AvailableTo = dto.AvailableTo;

        _context.SaveChanges();

        return Ok("Availability updated successfully");
    }
    [HttpDelete("availability/{id}")]
    public IActionResult DeleteAvailability(int id)
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var doctor = _context.Doctors
            .FirstOrDefault(x => x.UserId == userId);

        if (doctor == null)
            return NotFound();

        var availability = _context.DoctorAvailabilities
            .FirstOrDefault(x => x.Id == id &&
                                 x.DoctorId == doctor.Id);

        if (availability == null)
            return NotFound();

        if (availability.IsBooked)
            return BadRequest("Booked slot cannot be deleted.");

        _context.DoctorAvailabilities.Remove(availability);

        _context.SaveChanges();

        return Ok("Deleted successfully");
    }
    [HttpPut("profile")]
    public IActionResult UpdateProfile(UpdateDoctorProfileDto dto)
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var doctor = _context.Doctors
            .FirstOrDefault(x => x.UserId == userId);

        if (doctor == null)
            return NotFound("Doctor not found");

        var appUser = _context.Users
            .FirstOrDefault(x => x.Id == userId);

        if (appUser == null)
            return NotFound("User not found");

        appUser.FullName = dto.Name;
        appUser.Email = dto.Email;

        doctor.Specialization = dto.Specialization;
        doctor.HospitalName = dto.HospitalName;
        doctor.Fee = dto.Fee;
        doctor.About = dto.About;

        _context.SaveChanges();

        return Ok("Profile updated successfully");
    }
}