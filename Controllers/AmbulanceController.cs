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

        var requests = _context.AmbulanceRequests
            .Where(x => x.AmbulanceId == ambulance.Id)
            .ToList();

        return Ok(requests);
    }
    [HttpPut("request-status")]
    public IActionResult UpdateStatus(UpdateAmbulanceRequestDto dto)
    {
        var request = _context.AmbulanceRequests
            .FirstOrDefault(x => x.Id == dto.RequestId);

        if (request == null)
            return NotFound();

        request.Status = dto.Status;

        _context.SaveChanges();

        return Ok("Updated");
    }

}