using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HEALTHCARE.Data;
using HEALTHCARE.DTOs;

namespace HEALTHCARE.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "AmbulanceDriver")]
public class AmbulanceController : ControllerBase
{
    private readonly AppDbContext _context;

    public AmbulanceController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("requests")]
    public IActionResult GetRequests()
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var ambulance = _context.Ambulances
            .FirstOrDefault(x => x.UserId == userId);

        if (ambulance == null)
            return NotFound();

        // Joined with AppUser to get patient name + email.
        // NOTE: AppUser has no Phone field, so patient contact number
        // is not available here. Add a Phone column to AppUser if needed later.
        var requests = (
            from r in _context.AmbulanceRequests
            join u in _context.Users
                on r.UserId equals u.Id
            where r.AmbulanceId == ambulance.Id
            orderby r.RequestTime descending
            select new
            {
                r.Id,
                PatientName = u.FullName,
                PatientEmail = u.Email,
                r.PickupLocation,
                r.DestinationLocation,
                r.PickupLat,
                r.PickupLng,
                r.DestinationLat,
                r.DestinationLng,
                r.RequestTime,
                r.Status,
                r.Fare,
                r.VehicleType,
                r.DistanceKm
            }
        ).ToList();

        return Ok(requests);
    }

    [HttpPut("request-status")]
    public IActionResult UpdateStatus(UpdateAmbulanceRequestDto dto)
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var ambulance = _context.Ambulances
            .FirstOrDefault(x => x.UserId == userId);

        if (ambulance == null)
            return NotFound("Ambulance not found");

        var request = _context.AmbulanceRequests
            .FirstOrDefault(x => x.Id == dto.RequestId);

        if (request == null)
            return NotFound("Request not found");

        // Make sure a driver can only update their own assigned requests
        if (request.AmbulanceId != ambulance.Id)
            return Forbid();

        request.Status = dto.Status;

        // Free up the ambulance again once the ride is no longer active
        if (dto.Status is "Rejected" or "Cancelled" or "Completed")
        {
            ambulance.IsAvailable = true;
        }

        _context.SaveChanges();

        return Ok("Updated");
    }
}