using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using HEALTHCARE.Data;
using HEALTHCARE.DTOs;
using HEALTHCARE.Models;

namespace HEALTHCARE.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("doctor")]
    public IActionResult CreateDoctor(CreateDoctorDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.FullName))
            return BadRequest("Doctor name is required");

        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest("Email is required");

        if (string.IsNullOrWhiteSpace(dto.Password))
            return BadRequest("Password is required");

        if (_context.Users.Any(x => x.Email == dto.Email))
            return BadRequest("Email already exists");

        var user = new AppUser
        {
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash = dto.Password, // Later BCrypt use korbo
            Role = "Doctor"
        };

        _context.Users.Add(user);
        _context.SaveChanges();

        var doctor = new Doctor
        {
            UserId = user.Id,
            Specialization = dto.Specialization,
            HospitalName = dto.HospitalName,
            Fee = dto.Fee,
            About = dto.About
        };

        _context.Doctors.Add(doctor);
        _context.SaveChanges();

        return Ok(new
        {
            Message = "Doctor created successfully",
            DoctorId = doctor.Id,
            DoctorName = user.FullName,
            Email = user.Email
        });
    }

    [HttpGet("doctors")]
    public IActionResult GetDoctors()
    {
        var doctors = _context.Doctors
            .Select(d => new
            {
                d.Id,
                d.UserId,
                DoctorName = d.User.FullName,
                d.User.Email,
                d.Specialization,
                d.HospitalName,
                d.Fee,
                d.About
            })
            .ToList();

        return Ok(doctors);
    }

    [HttpDelete("doctor/{id}")]
    public IActionResult DeleteDoctor(int id)
    {
        var doctor = _context.Doctors.FirstOrDefault(x => x.Id == id);

        if (doctor == null)
            return NotFound("Doctor not found");

        // optional: remove user also
        var user = _context.Users.FirstOrDefault(x => x.Id == doctor.UserId);

        _context.Doctors.Remove(doctor);

        if (user != null)
            _context.Users.Remove(user);

        _context.SaveChanges();

        return Ok("Doctor removed successfully");
    }
    [HttpPost("product")]
    public IActionResult AddProduct(CreateProductDto dto)
    {
        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            Stock = dto.Stock
        };

        _context.Products.Add(product);
        _context.SaveChanges();

        return Ok(product);
    }
    [HttpGet("orders")]
    public IActionResult GetOrders()
    {
        var orders = (
            from o in _context.Orders
            join u in _context.Users
                on o.UserId equals u.Id
            select new
            {
                o.Id,
                CustomerName = u.FullName,
                CustomerEmail = u.Email,
                o.TotalAmount,
                o.OrderDate
            }
        ).ToList();

        return Ok(orders);
    }
    [HttpPost("ambulance")]
    public IActionResult CreateAmbulance(CreateAmbulanceDto dto)
    {
        if (_context.Users.Any(x => x.Email == dto.Email))
            return BadRequest("Email already exists");

        var user = new AppUser
        {
            FullName = dto.DriverName,
            Email = dto.Email,
            PasswordHash = dto.Password,
            Role = "AmbulanceDriver"
        };

        _context.Users.Add(user);
        _context.SaveChanges();

        var ambulance = new Ambulance
        {
            DriverName = dto.DriverName,
            DriverPhone = dto.DriverPhone,
            VehicleNumber = dto.VehicleNumber,
            UserId = user.Id
        };

        _context.Ambulances.Add(ambulance);
        _context.SaveChanges();

        return Ok("Ambulance created");
    }

    [HttpGet("ambulance-requests")]
    public IActionResult GetAllAmbulanceRequests()
    {
        return Ok(
            _context.AmbulanceRequests
                .OrderByDescending(x => x.RequestTime)
                .ToList());
    }
    [HttpGet("dashboard")]
    public IActionResult Dashboard()
    {
        var data = new
        {
            TotalPatients = _context.Users.Count(x => x.Role == "Patient"),

            TotalDoctors = _context.Doctors.Count(),

            TotalAmbulances = _context.Ambulances.Count(),

            TotalProducts = _context.Products.Count(),

            TotalAppointments = _context.Appointments.Count(),

            TotalOrders = _context.Orders.Count(),

            PendingAppointments = _context.Appointments
                .Count(x => x.Status == "Pending"),

            PendingAmbulanceRequests = _context.AmbulanceRequests
                .Count(x => x.Status == "Pending")
        };

        return Ok(data);
    }
    [HttpGet("recent-appointments")]
    public IActionResult RecentAppointments()
    {
        var data = (
            from a in _context.Appointments
            join p in _context.Users on a.PatientId equals p.Id
            join d in _context.Doctors on a.DoctorId equals d.Id
            join du in _context.Users on d.UserId equals du.Id
            orderby a.BookedAt descending
            select new
            {
                a.Id,
                PatientName = p.FullName,
                DoctorName = du.FullName,
                a.BookedAt,
                a.Status
            }
        )
        .Take(10)
        .ToList();

        return Ok(data);
    }
    [HttpGet("recent-orders")]
    public IActionResult RecentOrders()
    {
        var data = (
            from o in _context.Orders
            join u in _context.Users
                on o.UserId equals u.Id
            orderby o.OrderDate descending
            select new
            {
                o.Id,
                CustomerName = u.FullName,
                o.TotalAmount,
                o.OrderDate
            }
        )
        .Take(10)
        .ToList();

        return Ok(data);
    }
    [HttpGet("recent-ambulance-requests")]
    public IActionResult RecentAmbulanceRequests()
    {
        var data = (
            from r in _context.AmbulanceRequests
            join u in _context.Users
                on r.UserId equals u.Id
            join a in _context.Ambulances
                on r.AmbulanceId equals a.Id
            orderby r.RequestTime descending
            select new
            {
                r.Id,
                PatientName = u.FullName,
                a.DriverName,
                r.PickupLocation,
                r.DestinationLocation,
                r.Status,
                r.RequestTime
            }
        )
        .Take(10)
        .ToList();

        return Ok(data);
    }
    [HttpGet("revenue")]
    public IActionResult Revenue()
    {
        var totalRevenue = _context.Orders
            .Sum(x => (decimal?)x.TotalAmount) ?? 0;

        return Ok(new
        {
            TotalRevenue = totalRevenue
        });
    }
    [HttpGet("monthly-revenue")]
    public IActionResult MonthlyRevenue()
    {
        var data = _context.Orders
            .GroupBy(x => new
            {
                x.OrderDate.Year,
                x.OrderDate.Month
            })
            .Select(g => new
            {
                Year = g.Key.Year,
                Month = g.Key.Month,
                Revenue = g.Sum(x => x.TotalAmount)
            })
            .OrderBy(x => x.Year)
            .ThenBy(x => x.Month)
            .ToList();

        return Ok(data);
    }
    [HttpDelete("product/{id}")]
    public IActionResult DeleteProduct(int id)
    {
        var product = _context.Products.FirstOrDefault(x => x.Id == id);

        if (product == null)
            return NotFound("Product not found");

        _context.Products.Remove(product);
        _context.SaveChanges();

        return Ok("Product deleted");
    }
    [HttpDelete("appointment/{id}")]
    public IActionResult DeleteAppointment(int id)
    {
        var appointment = _context.Appointments.FirstOrDefault(x => x.Id == id);

        if (appointment == null)
            return NotFound("Appointment not found");

        _context.Appointments.Remove(appointment);
        _context.SaveChanges();

        return Ok("Appointment deleted");
    }

}