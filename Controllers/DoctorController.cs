using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HEALTHCARE.Data;
using HEALTHCARE.DTOs;
using HEALTHCARE.Models;
using Microsoft.EntityFrameworkCore;

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

    // Replace these three methods in your existing DoctorController.cs
    [HttpPost("availability")]
    public IActionResult AddAvailability(CreateAvailabilityDto dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var doctor = _context.Doctors.FirstOrDefault(x => x.UserId == userId);
        if (doctor == null) return NotFound("Doctor not found");

        var session = _context.HospitalSessions
            .Include(x => x.Hospital)
            .FirstOrDefault(x =>
                x.Id == dto.HospitalSessionId &&
                x.HospitalId == dto.HospitalId &&
                x.IsActive);

        if (session == null)
            return BadRequest("Invalid Hospital Session.");

        // Doctor sudhu FromTime/ToTime dey, Date na — Date session theke ashbe
        if (dto.FromTime < session.StartTime)
            return BadRequest($"Start time must be after {session.StartTime}");

        if (dto.ToTime > session.EndTime)
            return BadRequest($"End time must be before {session.EndTime}");

        if (dto.FromTime >= dto.ToTime)
            return BadRequest("Invalid time range.");

        // Doctor already ei session e slot niyeche kina check (overlap)
        bool overlap = _context.DoctorAvailabilities
        .Where(x =>
            x.DoctorId == doctor.Id &&
            x.HospitalSessionId == session.Id)
        .AsEnumerable() // EF query execute হবে, এরপর TimeOnly conversion হবে
        .Any(x =>
        {
            var existingFrom = TimeOnly.FromDateTime(x.AvailableFrom);
            var existingTo = TimeOnly.FromDateTime(x.AvailableTo);

            return dto.FromTime < existingTo &&
                   dto.ToTime > existingFrom;
        });

        if (overlap)
            return BadRequest("You already have a slot in this time range for this session.");

        var availableFrom = session.Date.ToDateTime(dto.FromTime);   // session-er Date use hocche
        var availableTo = session.Date.ToDateTime(dto.ToTime);

        var availability = new DoctorAvailability
        {
            DoctorId = doctor.Id,
            HospitalId = session.HospitalId,
            HospitalSessionId = session.Id,
            Place = session.Hospital.Name,
            AvailableFrom = availableFrom,
            AvailableTo = availableTo,
            MaxPatients = dto.MaxPatients < 1 ? 1 : dto.MaxPatients,
            BookedCount = 0,
            IsBooked = false
        };

        _context.DoctorAvailabilities.Add(availability);
        _context.SaveChanges();

        return Ok("Availability added successfully.");
    }

   [HttpGet("availability")]
public IActionResult GetAvailability()
{
    var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    var doctor = _context.Doctors.FirstOrDefault(x => x.UserId == userId);

    if (doctor == null)
        return NotFound();

    var now = DateTime.Now;

    // শুধুমাত্র যেসব slot শেষ হয়ে গেছে সেগুলো inactive করো
    var expired = _context.DoctorAvailabilities
        .Where(x =>
            x.DoctorId == doctor.Id &&
            x.IsActive &&
            x.AvailableTo < now)
        .ToList();

    if (expired.Any())
    {
        foreach (var slot in expired)
        {
            slot.IsActive = false;
        }

        _context.SaveChanges();
    }

    var data = _context.DoctorAvailabilities
        .Include(x => x.Hospital)
        .Include(x => x.HospitalSession)
        .Where(x =>
            x.DoctorId == doctor.Id &&
            x.IsActive)
        .OrderBy(x => x.AvailableFrom)
        .Select(x => new
        {
            x.Id,
            x.HospitalId,
            HospitalName = x.Hospital.Name,
            x.HospitalSessionId,
            Day = x.HospitalSession.Day,
            SessionStart = x.HospitalSession.StartTime,
            SessionEnd = x.HospitalSession.EndTime,
            x.AvailableFrom,
            x.AvailableTo,
            x.Place,
            x.MaxPatients,
            x.BookedCount,
            SeatsLeft = x.MaxPatients - x.BookedCount,
            x.IsBooked
        })
        .ToList();

    return Ok(data);
}

    [HttpPut("availability")]
    public IActionResult UpdateAvailability(UpdateAvailabilityDto dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var doctor = _context.Doctors.FirstOrDefault(x => x.UserId == userId);
        if (doctor == null) return NotFound("Doctor not found");

        var availability = _context.DoctorAvailabilities
            .FirstOrDefault(x => x.Id == dto.Id && x.DoctorId == doctor.Id);

        if (availability == null) return NotFound("Availability not found");
        if (availability.BookedCount > 0) return BadRequest("Cannot edit booked slot.");

        var session = _context.HospitalSessions
            .Include(x => x.Hospital)
            .FirstOrDefault(x =>
                x.Id == dto.HospitalSessionId &&
                x.HospitalId == dto.HospitalId &&
                x.IsActive);

        if (session == null) return BadRequest("Invalid Hospital Session.");

        if (dto.FromTime < session.StartTime)
            return BadRequest($"Start time must be after {session.StartTime}");
        if (dto.ToTime > session.EndTime)
            return BadRequest($"End time must be before {session.EndTime}");
        if (dto.FromTime >= dto.ToTime)
            return BadRequest("Invalid time range.");

        availability.HospitalId = session.HospitalId;
        availability.HospitalSessionId = session.Id;
        availability.Place = session.Hospital.Name;
        availability.AvailableFrom = session.Date.ToDateTime(dto.FromTime);  // session date
        availability.AvailableTo = session.Date.ToDateTime(dto.ToTime);
        availability.MaxPatients = dto.MaxPatients < 1 ? 1 : dto.MaxPatients;

        _context.SaveChanges();
        return Ok("Availability updated.");
    }

    [HttpGet("appointments")]
public IActionResult GetAppointments()
{
    var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    var doctor = _context.Doctors
        .FirstOrDefault(x => x.UserId == userId);

    if (doctor == null)
        return NotFound();

    var appointments = _context.Appointments
        .Include(a => a.Patient)
        .Include(a => a.DoctorAvailability)
        .Where(a => a.DoctorId == doctor.Id)
        .OrderByDescending(a => a.BookedAt)
        .Select(a => new
        {
            id = a.Id,
            patientId = a.PatientId,
            patientName = a.PatientName,
            patientEmail = a.PatientEmail,
            patientPhone = a.PatientPhone,
            gender = a.Gender,
            age = a.PatientDob.HasValue
                ? DateTime.Today.Year - a.PatientDob.Value.Year
                : 0,
            appointmentDate = a.DoctorAvailability!.AvailableFrom.ToString("dd MMM yyyy"),
            appointmentTime = a.DoctorAvailability.AvailableFrom.ToString("hh:mm tt"),
            status = a.Status,
            amount = a.AdvanceAmount,
            bookedAt = a.BookedAt,
            hasPrescription = _context.Prescriptions.Any(p => p.AppointmentId == a.Id)
        })
        .ToList();

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
                Phone = d.Phone,
                d.Specialization,
                d.HospitalName,
                Qualification = d.Qualification,
                Experience = d.Experience,
                d.Fee,
                d.About,
                ImageUrl = d.ImageUrl
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
        doctor.ImageUrl = dto.ImageUrl;
        doctor.Phone = dto.Phone;
        doctor.Qualification = dto.Qualification;
        doctor.Experience = dto.Experience;
        _context.SaveChanges();

        return Ok("Profile updated successfully");
    }

    [HttpPost("upload-image")]
    public async Task<IActionResult> UploadImage(IFormFile image)
    {
        if (image == null || image.Length == 0)
            return BadRequest("No image selected.");

        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var doctor = _context.Doctors
            .FirstOrDefault(x => x.UserId == userId);

        if (doctor == null)
            return NotFound("Doctor not found");

        var folder = Path.Combine(
            Directory.GetCurrentDirectory(),
            "wwwroot",
            "doctor-images");

        if (!Directory.Exists(folder))
            Directory.CreateDirectory(folder);

        var fileName =
            Guid.NewGuid().ToString() +
            Path.GetExtension(image.FileName);

        var path = Path.Combine(folder, fileName);

        using (var stream = new FileStream(path, FileMode.Create))
        {
            await image.CopyToAsync(stream);
        }

        doctor.ImageUrl = "/doctor-images/" + fileName;
        _context.SaveChanges();

        return Ok(new
        {
            imageUrl = doctor.ImageUrl
        });
    }

    [HttpGet("hospitals")]
    public IActionResult GetHospitals()
    {
        var data = _context.HospitalSessions
            .Include(x => x.Hospital)
            .Where(x => x.IsActive)
            .GroupBy(x => new
            {
                x.HospitalId,
                x.Hospital.Name
            })
            .Select(g => new
            {
                Id = g.Key.HospitalId,
                Name = g.Key.Name
            })
            .OrderBy(x => x.Name)
            .ToList();

        return Ok(data);
    }

    [HttpGet("hospital-sessions/{hospitalId}")]
    public IActionResult GetHospitalSessions(int hospitalId)
    {
        var data = _context.HospitalSessions
            .Where(x => x.HospitalId == hospitalId && x.IsActive)
            .OrderBy(x => x.Date)
            .ThenBy(x => x.StartTime)
            .Select(x => new
            {
                x.Id,
                x.Day,
                x.Date,
                x.StartTime,
                x.EndTime
            })
            .ToList();

        return Ok(data);
    }
}