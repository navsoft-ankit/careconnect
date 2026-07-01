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
    d.About,
    ImageUrl = d.ImageUrl
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

        var doctor = _context.Doctors
            .FirstOrDefault(x => x.Id == slot.DoctorId);

        var user = _context.Users
            .FirstOrDefault(x => x.Id == userId);

        decimal advanceAmount = doctor != null
            ? Math.Round(doctor.Fee * 0.5m, 2)
            : 0;

        decimal walletUsed = 0;

        // Use refund balance if selected
        if (dto.UseRefundBalance && user != null)
        {
            if (user.RefundBalance >= advanceAmount)
            {
                walletUsed = advanceAmount;
                user.RefundBalance -= advanceAmount;
                advanceAmount = 0;
            }
            else
            {
                walletUsed = user.RefundBalance;
                advanceAmount -= user.RefundBalance;
                user.RefundBalance = 0;
            }
        }

        slot.IsBooked = true;

        var appointment = new Appointment
        {
            PatientId = userId,
            DoctorId = slot.DoctorId,
            DoctorAvailabilityId = slot.Id,
            BookedAt = DateTime.UtcNow,
            Status = "Confirmed",

            PaymentStatus = dto.PaymentMethod == "Online"
                ? (advanceAmount > 0 ? "Paid" : "Wallet")
                : "Cash",

            AdvanceAmount = dto.PaymentMethod == "Online"
                ? advanceAmount
                : 0,

            RazorpayPaymentId = dto.PaymentMethod == "Online"
                ? (advanceAmount > 0 ? "DUMMY_PAYMENT" : "WALLET_PAYMENT")
                : null
        };

        _context.Appointments.Add(appointment);
        _context.SaveChanges();

        return Ok(new
        {
            AppointmentId = appointment.Id,
            AdvancePaid = appointment.AdvanceAmount,
            WalletUsed = walletUsed,
            WalletBalance = user?.RefundBalance ?? 0,
            Message = "Appointment booked successfully."
        });
    }

    [HttpGet("appointments")]
    public IActionResult MyAppointments()
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var appointments =
        (
            from a in _context.Appointments
            join d in _context.Doctors on a.DoctorId equals d.Id
            join u in _context.Users on d.UserId equals u.Id
            join s in _context.DoctorAvailabilities on a.DoctorAvailabilityId equals s.Id

            where a.PatientId == userId

            orderby a.BookedAt descending

            select new
            {
                a.Id,

                DoctorId = d.Id,
                DoctorName = u.FullName,
                Specialization = d.Specialization,
                Hospital = d.HospitalName,

                AppointmentDate = s.AvailableFrom.Date,
                AppointmentTime = s.AvailableFrom,

                a.Status,
                a.PaymentStatus,
                a.AdvanceAmount,

                SlotId = s.Id,
                Place = s.Place
            }

        ).ToList();

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
    private static readonly Dictionary<string, string[]> CityKeywords = new()
    {
        ["Kolkata"] = new[] { "kolkata", "calcutta", "park street", "ballygunge", "alipore" },
        ["Howrah"] = new[] { "howrah", "shibpur", "santragachi" },
        ["Salt Lake"] = new[] { "salt lake", "sector v", "bidhannagar" },
        ["New Town"] = new[] { "new town", "rajarhat" },
    };

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

        var slot = _context.DoctorAvailabilities
            .FirstOrDefault(x => x.Id == appointment.DoctorAvailabilityId);

        if (slot == null)
            return BadRequest("Appointment slot not found");

        var user = _context.Users.First(x => x.Id == userId);

        decimal refund = 0;

        var hoursLeft = (slot.AvailableFrom - DateTime.UtcNow).TotalHours;
        Console.WriteLine($"Hours Left: {hoursLeft}");
        Console.WriteLine($"Advance: {appointment.AdvanceAmount}");
        Console.WriteLine($"Current Wallet: {user.RefundBalance}");

        if (hoursLeft >= 1)
        {
            refund = Math.Round(appointment.AdvanceAmount * 0.5m, 2);
            user.RefundBalance += refund;
            Console.WriteLine($"Refund Added: {refund}");
            Console.WriteLine($"New Wallet: {user.RefundBalance}");
        }

        appointment.Status = "CancelledByUser";
        slot.IsBooked = false;

        _context.SaveChanges();

        return Ok(new
        {
            Message = "Appointment Cancelled",
            Refund = refund,
            Wallet = user.RefundBalance
        });
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
    [HttpGet("refund-balance")]
    public IActionResult GetRefundBalance()
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var user = _context.Users.Find(userId);

        return Ok(new
        {
            RefundBalance = user?.RefundBalance ?? 0
        });
    }
    [HttpGet("profile")]
    public IActionResult GetProfile()
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var user = _context.Users
            .FirstOrDefault(x => x.Id == userId);

        if (user == null)
            return NotFound("User not found");

        return Ok(new
        {
            fullName = user.FullName,
            email = user.Email,
            phone = user.Phone,
            gender = user.Gender,
            dob = user.Dob,
            bloodGroup = user.BloodGroup,
            address = user.Address,
            city = user.City,
            state = user.State,
            country = user.Country,
            pinCode = user.PinCode,
            avatarUrl = user.AvatarUrl
        });
    }

    [HttpPut("profile")]
    public IActionResult UpdateProfile(UpdateProfileDto dto)
    {
        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var user = _context.Users
            .FirstOrDefault(x => x.Id == userId);

        if (user == null)
            return NotFound("User not found");

        user.FullName = dto.FullName;
        user.Phone = dto.Phone;
        user.Gender = dto.Gender;
        user.Dob = dto.Dob;
        user.BloodGroup = dto.BloodGroup;
        user.Address = dto.Address;
        user.City = dto.City;
        user.State = dto.State;
        user.Country = dto.Country;
        user.PinCode = dto.PinCode;
        user.AvatarUrl = dto.AvatarUrl;

        _context.SaveChanges();

        return Ok(new
        {
            fullName = user.FullName,
            email = user.Email,
            phone = user.Phone,
            gender = user.Gender,
            dob = user.Dob,
            bloodGroup = user.BloodGroup,
            address = user.Address,
            city = user.City,
            state = user.State,
            country = user.Country,
            pinCode = user.PinCode
        });
    }
    [HttpPost("avatar")]
    public async Task<IActionResult> UploadAvatar(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("No file selected.");

        var userId = int.Parse(
            User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var user = _context.Users
            .FirstOrDefault(x => x.Id == userId);

        if (user == null)
            return NotFound("User not found");

        var folder = Path.Combine(
            Directory.GetCurrentDirectory(),
            "wwwroot",
            "avatars");

        if (!Directory.Exists(folder))
            Directory.CreateDirectory(folder);

        var fileName = Guid.NewGuid().ToString() +
                       Path.GetExtension(file.FileName);

        var path = Path.Combine(folder, fileName);

        using (var stream = new FileStream(path, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        user.AvatarUrl = "/avatars/" + fileName;

        _context.SaveChanges();

        return Ok(new
        {
            avatarUrl = user.AvatarUrl
        });
    }
}