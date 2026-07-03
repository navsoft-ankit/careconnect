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
public class AdminSlotRequestController : ControllerBase
{
    private readonly AppDbContext _context;
    public AdminSlotRequestController(AppDbContext context)
    {
        _context = context;
    }
    // ======================================
    // GET ALL SLOT REQUESTS
    // ======================================

    [HttpGet("slot-requests")]
    public IActionResult GetRequests()
    {
        var data = _context.DoctorSlotRequests
            .Include(x => x.Doctor)
            .Include(x => x.Hospital)
            .OrderByDescending(x => x.RequestedAt)
            .Select(x => new
            {
                x.Id,
                DoctorName = x.Doctor!.User.FullName,
                Hospital = x.Hospital!.Name,
                x.RequestedFrom,
                x.RequestedTo,
                x.MaxPatients,
                x.Status,
                x.AdminRemark,
                x.RequestedAt
            })
            .ToList();

        return Ok(data);
    }

    // ======================================
    // APPROVE / REJECT
    // ======================================

    [HttpPut("slot-request")]
    public IActionResult ApproveRequest(ApproveDoctorSlotDto dto)
    {
        var request = _context.DoctorSlotRequests
            .Include(x => x.Hospital)
            .Include(x => x.HospitalSession)
            .FirstOrDefault(x => x.Id == dto.RequestId);

        if (request == null)
            return NotFound("Request not found.");

        if (request.Status != "Pending")
            return BadRequest("Already processed.");

        // Reject
        if (!dto.Approve)
        {
            request.Status = "Rejected";
            request.AdminRemark = dto.AdminRemark;

            _context.SaveChanges();

            return Ok("Request rejected.");
        }

        // Overlap Check
        var overlap = _context.DoctorAvailabilities.Any(x =>
            x.DoctorId == request.DoctorId &&
            request.RequestedFrom < x.AvailableTo &&
            request.RequestedTo > x.AvailableFrom);

        if (overlap)
            return BadRequest("Doctor already has another approved slot.");

        // Create Availability
        var availability = new DoctorAvailability
        {
            DoctorId = request.DoctorId,
            HospitalId = request.HospitalId,
            HospitalSessionId = request.HospitalSessionId,
            AvailableFrom = request.RequestedFrom,
            AvailableTo = request.RequestedTo,
            Place = request.Hospital!.Name,
            MaxPatients = request.MaxPatients,
            BookedCount = 0,
            IsBooked = false,
            Status = "Approved",
            IsApproved = true
        };
        _context.DoctorAvailabilities.Add(availability);
        request.Status = "Approved";
        request.AdminRemark = dto.AdminRemark;
        _context.SaveChanges();
        return Ok("Request approved.");
    }
}