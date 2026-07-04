using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HEALTHCARE.Data;
using HEALTHCARE.DTOs;
using HEALTHCARE.Models;
namespace HEALTHCARE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewController : ControllerBase
{
    private readonly AppDbContext _context;
    public ReviewController(AppDbContext context)
    {
        _context = context;
    }

    // Patient -> review dibe, but only jodi appointment Completed thake
    [HttpPost("add")]
    [Authorize(Roles = "Patient")]
    public IActionResult AddReview(CreateReviewDto dto)
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var appointment = _context.Appointments
            .FirstOrDefault(x =>
                x.Id == dto.AppointmentId &&
                x.PatientId == userId);

        if (appointment == null)
            return NotFound("Appointment not found");

        if (appointment.Status != "Completed")
            return BadRequest("You can review only after appointment is completed");

        var alreadyReviewed = _context.Reviews
            .Any(x => x.AppointmentId == dto.AppointmentId);

        if (alreadyReviewed)
            return BadRequest("You already reviewed this appointment");

        if (dto.Rating < 1 || dto.Rating > 5)
            return BadRequest("Rating must be between 1 and 5");

        var review = new Review
        {
            AppointmentId = appointment.Id,
            DoctorId = appointment.DoctorId,
            PatientId = userId,
            Rating = dto.Rating,
            Comment = dto.Comment,
            CreatedAt = DateTime.UtcNow
        };

        _context.Reviews.Add(review);
        _context.SaveChanges();

        return Ok("Review submitted");
    }

    // Public-ish: kono doctor-er sob review dekha jabe (Patient login thakleo dekhte parbe)
    [HttpGet("doctor/{doctorId}")]
    public IActionResult GetDoctorReviews(int doctorId)
    {
        var reviews = (
            from r in _context.Reviews
            join u in _context.Users
                on r.PatientId equals u.Id
            where r.DoctorId == doctorId
            orderby r.CreatedAt descending
            select new
            {
                r.Id,
                PatientName = u.FullName,
                r.Rating,
                r.Comment,
                r.CreatedAt
            }
        ).ToList();

        var avgRating = reviews.Count > 0
            ? Math.Round(reviews.Average(x => x.Rating), 1)
            : 0;

        return Ok(new
        {
            AverageRating = avgRating,
            TotalReviews = reviews.Count,
            Reviews = reviews
        });
    }

    // Patient nijer dewa reviews dekhbe
    [HttpGet("my-reviews")]
    [Authorize(Roles = "Patient")]
    public IActionResult MyReviews()
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var reviews = _context.Reviews
            .Where(x => x.PatientId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToList();

        return Ok(reviews);
    }

    // Admin -> spam/abusive review delete korte parbe
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult DeleteReview(int id)
    {
        var review = _context.Reviews.FirstOrDefault(x => x.Id == id);

        if (review == null)
            return NotFound("Review not found");

        _context.Reviews.Remove(review);
        _context.SaveChanges();

        return Ok("Review deleted");
    }
}