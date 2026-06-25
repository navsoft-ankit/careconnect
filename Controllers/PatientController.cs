using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HEALTHCARE.Data;
using HEALTHCARE.DTOs;
using HEALTHCARE.Models;

namespace HEALTHCARE.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Patient")]
public class PatientController : ControllerBase
{
    private readonly AppDbContext _context;

    public PatientController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("doctors")]
    public IActionResult GetDoctors()
    {
        var doctors = _context.Doctors
            .Include(x => x.User)
            .Select(d => new
            {
                d.Id,
                Name = d.User.FullName,
                d.User.Email,
                d.Specialization,
                d.HospitalName,
                d.Fee,
                d.About
            })
            .ToList();

        return Ok(doctors);
    }

    [HttpGet("doctor/{doctorId}/slots")]
    public IActionResult GetDoctorSlots(int doctorId)
    {
        var slots = _context.DoctorAvailabilities
            .Where(x =>
                x.DoctorId == doctorId &&
                !x.IsBooked)
            .OrderBy(x => x.AvailableFrom)
            .ToList();

        return Ok(slots);
    }

    [HttpPost("book")]
    public IActionResult BookAppointment(BookAppointmentDto dto)
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var slot = _context.DoctorAvailabilities
            .FirstOrDefault(x => x.Id == dto.DoctorAvailabilityId);

        if (slot == null)
            return NotFound("Slot not found");

        if (slot.IsBooked)
            return BadRequest("Slot already booked");

        slot.IsBooked = true;

        var appointment = new Appointment
        {
            PatientId = userId,
            DoctorId = slot.DoctorId,
            DoctorAvailabilityId = slot.Id,
            BookedAt = DateTime.UtcNow,
            Status = "Pending"
        };

        _context.Appointments.Add(appointment);

        _context.SaveChanges();

        return Ok(new
        {
            Message = "Appointment booked successfully"
        });
    }

    [HttpGet("appointments")]
    public IActionResult MyAppointments()
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var appointments = _context.Appointments
            .Where(x => x.PatientId == userId)
            .OrderByDescending(x => x.BookedAt)
            .ToList();

        return Ok(appointments);
    }
    [HttpGet("products")]
    public IActionResult GetProducts()
    {
        return Ok(_context.Products.ToList());
    }
    [HttpPost("order")]
    public IActionResult PlaceOrder(PlaceOrderDto dto)
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var product = _context.Products
            .FirstOrDefault(x => x.Id == dto.ProductId);

        if (product == null)
            return NotFound("Product not found");

        if (product.Stock < dto.Quantity)
            return BadRequest("Insufficient stock");

        var total = product.Price * dto.Quantity;

        var order = new Order
        {
            UserId = userId,
            TotalAmount = total,
            OrderDate = DateTime.UtcNow
        };

        _context.Orders.Add(order);
        _context.SaveChanges();

        var orderItem = new OrderItem
        {
            OrderId = order.Id,
            ProductId = product.Id,
            Quantity = dto.Quantity,
            UnitPrice = product.Price
        };

        _context.OrderItems.Add(orderItem);

        product.Stock -= dto.Quantity;

        _context.SaveChanges();

        return Ok(new
        {
            OrderId = order.Id,
            TotalAmount = total
        });
    }
    [HttpGet("orders")]
    public IActionResult MyOrders()
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var orders = _context.Orders
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.OrderDate)
            .ToList();

        return Ok(orders);
    }
    [HttpGet("ambulances")]
    public IActionResult GetAmbulances()
    {
        return Ok(
            _context.Ambulances
                .Where(x => x.IsAvailable)
                .ToList());
    }
    [HttpPost("ambulance-request")]
    public IActionResult RequestAmbulance(CreateAmbulanceRequestDto dto)
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var ambulance = _context.Ambulances
            .FirstOrDefault(x =>
                x.Id == dto.AmbulanceId);

        if (ambulance == null)
            return NotFound();

        var request = new AmbulanceRequest
        {
            UserId = userId,
            AmbulanceId = dto.AmbulanceId,
            PickupLocation = dto.PickupLocation,
            DestinationLocation = dto.DestinationLocation
        };

        _context.AmbulanceRequests.Add(request);

        _context.SaveChanges();

        return Ok("Request created");
    }
    [HttpPut("appointment/cancel/{id}")]
    public IActionResult CancelAppointment(int id)
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var appointment = _context.Appointments
            .FirstOrDefault(x => x.Id == id && x.PatientId == userId);

        if (appointment == null)
            return NotFound("Appointment not found");

        var diff = DateTime.UtcNow - appointment.BookedAt;

        if (diff.TotalHours > 2)
            return BadRequest("You can cancel only within 2 hours");

        if (appointment.Status == "CancelledByAdmin")
            return BadRequest("Already cancelled by admin");

        appointment.Status = "CancelledByUser";

        _context.SaveChanges();

        return Ok("Appointment cancelled by user");
    }
}