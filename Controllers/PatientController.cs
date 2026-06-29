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

        if (string.IsNullOrWhiteSpace(dto.RazorpayPaymentId))
            return BadRequest("Payment verification required before booking");

        var doctor = _context.Doctors.FirstOrDefault(x => x.Id == slot.DoctorId);
        var advanceAmount = doctor != null ? Math.Round(doctor.Fee * 0.5m, 2) : 0;

        slot.IsBooked = true;

        var appointment = new Appointment
        {
            PatientId = userId,
            DoctorId = slot.DoctorId,
            DoctorAvailabilityId = slot.Id,
            BookedAt = DateTime.UtcNow,
            Status = "Confirmed",
            PaymentStatus = "Paid",
            AdvanceAmount = advanceAmount,
            RazorpayPaymentId = dto.RazorpayPaymentId
        };

        _context.Appointments.Add(appointment);
        _context.SaveChanges();

        return Ok(new
        {
            Message = "Appointment booked successfully",
            AppointmentId = appointment.Id,
            AdvancePaid = advanceAmount
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

        if (string.IsNullOrWhiteSpace(dto.DeliveryAddress))
            return BadRequest("Delivery address is required");

        var product = _context.Products
            .FirstOrDefault(x => x.Id == dto.ProductId);

        if (product == null)
            return NotFound("Product not found");

        if (product.Stock < dto.Quantity)
            return BadRequest("Insufficient stock");

        var paymentMode = dto.PaymentMode == "Online" ? "Online" : "COD";

        if (paymentMode == "Online" && string.IsNullOrWhiteSpace(dto.RazorpayPaymentId))
            return BadRequest("Payment verification required for online payment");

        var total = product.Price * dto.Quantity;

        var order = new Order
        {
            UserId = userId,
            TotalAmount = total,
            OrderDate = DateTime.UtcNow,
            Status = "Pending",
            DeliveryAddress = dto.DeliveryAddress,
            PaymentMode = paymentMode,
            PaymentStatus = paymentMode == "Online" ? "Paid" : "Pending",
            RazorpayPaymentId = dto.RazorpayPaymentId
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
            TotalAmount = total,
            PaymentMode = order.PaymentMode,
            PaymentStatus = order.PaymentStatus
        });
    }
    [HttpGet("orders")]
    public IActionResult MyOrders()
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var orders = (
            from o in _context.Orders
            where o.UserId == userId
            join oi in _context.OrderItems on o.Id equals oi.OrderId into items
            from oi in items.DefaultIfEmpty()
            join p in _context.Products on oi.ProductId equals p.Id into products
            from p in products.DefaultIfEmpty()
            orderby o.OrderDate descending
            select new
            {
                o.Id,
                o.TotalAmount,
                o.OrderDate,
                o.Status,
                o.DeliveryAddress,
                o.PaymentMode,
                o.PaymentStatus,
                ProductName = p != null ? p.Name : null,
                Quantity = oi != null ? oi.Quantity : 0
            }
        ).ToList();

        return Ok(orders);
    }
    [HttpGet("ambulances")]
    public IActionResult GetAmbulances()
    {
        return Ok(
           _context.Ambulances
    .Select(x => new
    {
        x.Id,
        x.DriverName,
        x.VehicleNumber,
        x.Type,
        x.IsAvailable
    })
    .ToList());
    }
    // Fixed city list with keyword matching against HospitalName, since
    // no entity currently stores an explicit City field. Add more cities
    // and keywords here as the platform expands.
    private static readonly Dictionary<string, string[]> CityKeywords = new()
    {
        ["Kolkata"] = new[] { "kolkata", "calcutta", "park street", "ballygunge", "alipore" },
        ["Howrah"] = new[] { "howrah", "shibpur", "santragachi" },
        ["Salt Lake"] = new[] { "salt lake", "sector v", "bidhannagar" },
        ["New Town"] = new[] { "new town", "rajarhat" },
    };

    // Rough bounding boxes for the same cities, used to bucket ambulances
    // by their stored lat/lng since they don't have a HospitalName to match against.
    private static readonly Dictionary<string, (double MinLat, double MaxLat, double MinLng, double MaxLng)> CityBounds = new()
    {
        ["Kolkata"] = (22.45, 22.62, 88.30, 88.42),
        ["Howrah"] = (22.55, 22.62, 88.25, 88.34),
        ["Salt Lake"] = (22.56, 22.61, 88.40, 88.45),
        ["New Town"] = (22.57, 22.65, 88.45, 88.52),
    };

    private static string MatchCityFromHospitalName(string hospitalName)
    {
        if (string.IsNullOrWhiteSpace(hospitalName))
            return "Other";

        var lower = hospitalName.ToLowerInvariant();

        foreach (var (city, keywords) in CityKeywords)
        {
            if (keywords.Any(k => lower.Contains(k)))
                return city;
        }

        return "Other";
    }

    private static string MatchCityFromCoordinates(double lat, double lng)
    {
        foreach (var (city, bounds) in CityBounds)
        {
            if (lat >= bounds.MinLat && lat <= bounds.MaxLat &&
                lng >= bounds.MinLng && lng <= bounds.MaxLng)
                return city;
        }

        return "Other";
    }

    [HttpGet("coverage")]
    public IActionResult GetServiceCoverage()
    {
        var doctors = _context.Doctors.ToList();
        var ambulances = _context.Ambulances.Where(a => a.IsAvailable).ToList();
        var productCount = _context.Products.Count();

        var cityNames = CityKeywords.Keys.ToList();

        var coverage = cityNames.Select(city => new
        {
            City = city,
            DoctorCount = doctors.Count(d => MatchCityFromHospitalName(d.HospitalName) == city),
            AvailableAmbulances = ambulances.Count(a => MatchCityFromCoordinates(a.Latitude, a.Longitude) == city),
            // Medicine delivery is platform-wide for now — every covered city
            // gets pharmacy access as long as we have any products listed.
            MedicineDeliveryAvailable = productCount > 0,
        })
        .ToList();

        return Ok(coverage);
    }
    [HttpPost("ambulance-request")]
    public IActionResult RequestAmbulance(CreateAmbulanceRequestDto dto)
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var ambulance = _context.Ambulances
            .FirstOrDefault(x => x.Id == dto.AmbulanceId);

        if (ambulance == null)
            return NotFound("Ambulance not found");

        if (!ambulance.IsAvailable)
            return BadRequest("This ambulance is not available right now");

        // Server-side recalculation — never trust client-sent fare
        double distanceKm = HaversineKm(dto.PickupLat, dto.PickupLng, dto.DestinationLat, dto.DestinationLng);
        decimal fare = Math.Round(RatePerKm(dto.VehicleType) * (decimal)distanceKm, 2);

        var request = new AmbulanceRequest
        {
            UserId = userId,
            AmbulanceId = dto.AmbulanceId,
            PickupLocation = dto.PickupLocation,
            DestinationLocation = dto.DestinationLocation,
            PickupLat = dto.PickupLat,
            PickupLng = dto.PickupLng,
            DestinationLat = dto.DestinationLat,
            DestinationLng = dto.DestinationLng,
            VehicleType = dto.VehicleType,
            Fare = fare,
            DistanceKm = Math.Round(distanceKm, 2),
            Status = "Pending",
            RequestTime = DateTime.UtcNow
        };

        _context.AmbulanceRequests.Add(request);
        ambulance.IsAvailable = false; // lock while dispatched

        _context.SaveChanges();

        return Ok(new
        {
            Message = "Request created",
            RequestId = request.Id,
            DistanceKm = request.DistanceKm,
            Fare = fare
        });
    }

    // Add these two private static helpers anywhere in the PatientController class:

    private static double HaversineKm(double lat1, double lon1, double lat2, double lon2)
    {
        double ToRad(double deg) => deg * Math.PI / 180.0;
        const double R = 6371; // km
        double dLat = ToRad(lat2 - lat1);
        double dLon = ToRad(lon2 - lon1);
        double a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                   Math.Cos(ToRad(lat1)) * Math.Cos(ToRad(lat2)) *
                   Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c;
    }

    private static decimal RatePerKm(string vehicleType) => vehicleType switch
    {
        "AC" => 50m,
        "Big" => 150m,
        _ => 25m // NonAC default
    };
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
    [HttpGet("ambulance-request/{id}")]
    public IActionResult GetAmbulanceRequestStatus(int id)
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var request = _context.AmbulanceRequests
            .FirstOrDefault(x => x.Id == id && x.UserId == userId);

        if (request == null)
            return NotFound("Request not found");

        var ambulance = _context.Ambulances
            .FirstOrDefault(x => x.Id == request.AmbulanceId);

        return Ok(new
        {
            request.Id,
            request.Status,
            request.PickupLocation,
            request.DestinationLocation,
            request.Fare,
            request.DistanceKm,
            request.VehicleType,
            request.RequestTime,
            DriverName = ambulance != null ? ambulance.DriverName : null,
            VehicleNumber = ambulance != null ? ambulance.VehicleNumber : null
        });
    }
}