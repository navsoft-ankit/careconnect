using HEALTHCARE.Data;
using HEALTHCARE.DTOs;
using HEALTHCARE.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HEALTHCARE.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class HospitalSessionController : ControllerBase
{
    private readonly AppDbContext _context;
    public HospitalSessionController(AppDbContext context)
    {
        _context = context;
    }

    // =========================
    // CREATE SESSION
    // =========================

    [HttpPost("hospital-session")]
    public IActionResult Create([FromBody] CreateHospitalSessionDto dto)
    {
        if (!ModelState.IsValid)
        {
            var errors = ModelState
                .Where(x => x.Value.Errors.Count > 0)
                .Select(x => new
                {
                    Field = x.Key,
                    Errors = x.Value.Errors.Select(e => e.ErrorMessage)
                });

            return BadRequest(errors);
        }

        var hospital = _context.Hospitals
            .FirstOrDefault(x => x.Id == dto.HospitalId);
        if (hospital == null)
            return NotFound("Hospital not found");

        if (dto.StartTime >= dto.EndTime)
            return BadRequest("Invalid time range.");

        var session = new HospitalSession
        {
            HospitalId = dto.HospitalId,
            Day = dto.Day,
            Date = dto.Date,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            PlaceToVisit = dto.PlaceToVisit,
            IsActive = true
        };
        _context.HospitalSessions.Add(session);
        _context.SaveChanges();

        return Ok("Created");
    }

    // =========================
    // GET ALL
    // =========================

    [HttpGet("hospital-sessions")]
    public IActionResult GetAll()
    {
        var data = _context.HospitalSessions
            .Include(x => x.Hospital)
            .OrderByDescending(x => x.Id)   // Latest first
           .Select(x => new
           {
               x.Id,
               HospitalId = x.HospitalId,
               HospitalName = x.Hospital.Name,
               x.Day,
               x.Date,
               x.StartTime,
               x.EndTime,
               x.PlaceToVisit,
               x.IsActive,
               IsExpired = x.Date < DateOnly.FromDateTime(DateTime.Today)
           })
            .ToList();
        return Ok(data);
    }
    // =========================
    // UPDATE
    // =========================

    [HttpPut("hospital-session/{id}")]
    public IActionResult Update(int id, [FromBody] CreateHospitalSessionDto dto)
    {
        var session = _context.HospitalSessions
            .FirstOrDefault(x => x.Id == id);

        if (session == null)
            return NotFound("Session not found");

        if (dto.StartTime >= dto.EndTime)
            return BadRequest("Invalid time.");

        session.HospitalId = dto.HospitalId;
        session.Day = dto.Day;
        session.Date = dto.Date;
        session.StartTime = dto.StartTime;
        session.EndTime = dto.EndTime;
        session.PlaceToVisit = dto.PlaceToVisit;
        _context.SaveChanges();

        return Ok(new
        {
            Message = "Updated successfully"
        });
    }

    // =========================
    // DELETE
    // =========================

    [HttpDelete("hospital-session/{id}")]
    public IActionResult Delete(int id)
    {
        var session = _context.HospitalSessions
            .FirstOrDefault(x => x.Id == id);

        if (session.Date < DateOnly.FromDateTime(DateTime.Today))
        {
            return BadRequest(
                "Expired sessions cannot be deleted. Please cancel them instead."
            );
        }

        if (session == null)
            return NotFound("Session not found");

        bool used = _context.DoctorAvailabilities
            .Any(x => x.HospitalSessionId == id);

        if (used)
            return BadRequest("This session is already assigned to a doctor's availability.");

        _context.HospitalSessions.Remove(session);
        _context.SaveChanges();

        return Ok(new
        {
            Message = "Deleted successfully"
        });
    }

    // =========================
    // ACTIVE / INACTIVE
    // =========================

    [HttpPut("hospital-session/{id}/toggle")]
    public IActionResult Toggle(int id)
    {
        var session = _context.HospitalSessions
            .FirstOrDefault(x => x.Id == id);

        if (session == null)
            return NotFound();

        if (session.Date < DateOnly.FromDateTime(DateTime.Today))
            return BadRequest("Expired session cannot be activated.");

        session.IsActive = !session.IsActive;

        _context.SaveChanges();

        return Ok(new
        {
            session.IsActive
        });
    }
    // =========================
    // CANCEL EXPIRED SESSION
    // =========================

    [HttpPut("hospital-session/{id}/cancel")]
    public IActionResult Cancel(int id)
    {
        var session = _context.HospitalSessions
            .FirstOrDefault(x => x.Id == id);

        if (session == null)
            return NotFound("Session not found");

        if (session.Date >= DateOnly.FromDateTime(DateTime.Today))
            return BadRequest("Only expired sessions can be cancelled.");

        session.IsActive = false;

        _context.SaveChanges();

        return Ok(new
        {
            Message = "Expired session cancelled."
        });
    }
}