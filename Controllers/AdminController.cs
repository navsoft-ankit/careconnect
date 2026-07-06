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
    public IActionResult CreateDoctor([FromBody] CreateDoctorDto dto)
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
            name = dto.FullName,
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
    public async Task<IActionResult> AddProduct([FromForm] CreateProductDto dto)
    {
        string? imagePath = null;

        if (dto.Image != null)
        {
            var folder = Path.Combine(
                Directory.GetCurrentDirectory(),
                "wwwroot",
                "uploads",
                "products"
            );

            if (!Directory.Exists(folder))
                Directory.CreateDirectory(folder);

            var fileName =
                Guid.NewGuid() +
                Path.GetExtension(dto.Image.FileName);

            var fullPath = Path.Combine(folder, fileName);

            using var stream = new FileStream(fullPath, FileMode.Create);

            await dto.Image.CopyToAsync(stream);

            imagePath = "/uploads/products/" + fileName;
        }

        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            Stock = dto.Stock,
            Category = dto.Category,
            ImageUrl = imagePath
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
            TotalHospitals = _context.Hospitals.Count(),
            TotalAmbulances = _context.Ambulances.Count(),
            TotalProducts = _context.Products.Count(),
            TotalAppointments = _context.Appointments.Count(),
            TotalOrders = _context.Orders.Count(),
            PendingAppointments = _context.Appointments.Count(x => x.Status == "Pending"),
            PendingAmbulanceRequests = _context.AmbulanceRequests.Count(x => x.Status == "Pending"),
            totalMessages = _context.Contacts.Count()
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

    [HttpGet("products")]
    public IActionResult GetProducts()
    {
        return Ok(_context.Products.ToList());
    }

    [HttpGet("ambulances")]
    public IActionResult GetAmbulances()
    {
        var ambulances = (
            from a in _context.Ambulances
            join u in _context.Users
                on a.UserId equals u.Id
            select new
            {
                a.Id,
                a.DriverName,
                Email = u.Email,
                a.DriverPhone,
                a.VehicleNumber
            }
        ).ToList();

        return Ok(ambulances);
    }

    [HttpGet("appointments")]
    public IActionResult GetAppointments()
    {
        var appointments = (
            from a in _context.Appointments
            join p in _context.Users on a.PatientId equals p.Id
            join d in _context.Doctors on a.DoctorId equals d.Id
            join du in _context.Users on d.UserId equals du.Id
            join av in _context.DoctorAvailabilities
                on a.DoctorAvailabilityId equals av.Id

            orderby av.AvailableFrom descending

            select new
            {
                a.Id,

                PatientName = string.IsNullOrWhiteSpace(a.PatientName)
                    ? p.FullName
                    : a.PatientName,

                DoctorName = du.FullName,
                a.Status,
                BookedAt = a.BookedAt,
                AppointmentTime = av.AvailableFrom
            }

        ).ToList();

        return Ok(appointments);
    }

    [HttpPut("appointment/cancel/{id}")]
    public IActionResult CancelAppointment(int id)
    {
        var appointment = _context.Appointments
            .FirstOrDefault(x => x.Id == id);

        if (appointment == null)
            return NotFound("Appointment not found");

        var slot = _context.DoctorAvailabilities
            .FirstOrDefault(x => x.Id == appointment.DoctorAvailabilityId);

        if (slot == null)
            return NotFound("Slot not found");

        if (slot.AvailableFrom <= DateTime.Now)
            return BadRequest("Past appointment cannot be cancelled.");

        if (appointment.Status == "Completed")
            return BadRequest("Completed appointment cannot be cancelled.");

        if (appointment.Status == "Cancelled")
            return BadRequest("Already cancelled.");

        if (appointment.Status == "CancelledByUser")
            return BadRequest("Already cancelled by patient.");

        appointment.Status = "Cancelled";

        _context.SaveChanges();

        return Ok("Appointment cancelled.");
    }

    [HttpDelete("ambulance/{id}")]
    public IActionResult DeleteAmbulance(int id)
    {
        var ambulance = _context.Ambulances.FirstOrDefault(x => x.Id == id);

        if (ambulance == null)
            return NotFound("Ambulance not found");

        _context.Ambulances.Remove(ambulance);

        _context.SaveChanges();

        return Ok("Ambulance deleted");
    }

    [HttpGet("ambulance-bookings")]
    public IActionResult GetAmbulanceBookings()
    {
        var data = (
            from r in _context.AmbulanceRequests
            join p in _context.Users on r.UserId equals p.Id
            join a in _context.Ambulances on r.AmbulanceId equals a.Id
            select new
            {
                r.Id,
                PatientName = p.FullName,
                PatientEmail = p.Email,
                a.DriverName,
                a.VehicleNumber,
                r.PickupLocation,
                r.DestinationLocation,
                r.Fare,
                r.Status,
                r.RequestTime
            }
        ).OrderByDescending(x => x.RequestTime).ToList();

        return Ok(data);
    }

    [HttpGet("product-orders")]
    public IActionResult GetProductOrders()
    {
        var data = (
            from oi in _context.OrderItems
            join o in _context.Orders on oi.OrderId equals o.Id
            join u in _context.Users on o.UserId equals u.Id
            join p in _context.Products on oi.ProductId equals p.Id

            orderby o.OrderDate descending

            select new
            {
                OrderId = o.Id,
                CustomerName = u.FullName,
                CustomerEmail = u.Email,
                ProductName = p.Name,
                oi.Quantity,
                oi.UnitPrice,
                Total = oi.Quantity * oi.UnitPrice,
                o.Status,
                o.PaymentStatus,
                o.OrderDate
            }

        ).ToList();

        return Ok(data);
    }

    [HttpPut("product/{id}/stock")]
    public IActionResult UpdateStock(int id, UpdateStockDto dto)
    {
        var product = _context.Products.FirstOrDefault(x => x.Id == id);

        if (product == null)
            return NotFound("Product not found");

        if (dto.Stock < 0)
            return BadRequest("Stock cannot be negative");

        product.Stock = dto.Stock;

        _context.SaveChanges();

        return Ok(new
        {
            Message = "Stock updated",
            ProductId = product.Id,
            Stock = product.Stock
        });
    }

    [HttpPut("product/{id}/category")]
    public IActionResult UpdateCategory(int id, [FromBody] UpdateCategoryDto dto)
    {
        var product = _context.Products.FirstOrDefault(x => x.Id == id);
        if (product == null) return NotFound();

        product.Category = dto.Category;
        _context.SaveChanges();
        return Ok();
    }

    [HttpPut("product-order/{id}/status")]
    public IActionResult UpdateProductOrderStatus(int id, [FromBody] string status)
    {
        var order = _context.Orders.FirstOrDefault(x => x.Id == id);

        if (order == null)
            return NotFound("Order not found");

        order.Status = status;

        _context.SaveChanges();

        return Ok(new
        {
            Message = "Order status updated",
            Status = order.Status
        });
    }

    [HttpPut("product-order/{id}/payment")]
    public IActionResult UpdatePaymentStatus(int id)
    {
        var order = _context.Orders.FirstOrDefault(x => x.Id == id);

        if (order == null)
            return NotFound("Order not found");

        if (order.Status != "Delivered")
            return BadRequest("Order must be delivered first");

        order.PaymentStatus = "Paid";

        _context.SaveChanges();

        return Ok(new
        {
            Message = "Payment received successfully"
        });
    }

    [HttpPost("hospital")]
    public IActionResult CreateHospital(CreateHospitalDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Hospital name is required");

        if (_context.Hospitals.Any(x => x.Name == dto.Name))
            return BadRequest("Hospital already exists");

        var hospital = new Hospital
        {
            Name = dto.Name,
            Address = dto.Address,
            City = dto.City,
            Phone = dto.Phone,
            IsActive = true
        };

        _context.Hospitals.Add(hospital);
        _context.SaveChanges();

        return Ok(new
        {
            Message = "Hospital created successfully",
            HospitalId = hospital.Id
        });
    }

    [HttpGet("hospitals")]
    public IActionResult GetHospitals()
    {
        var hospitals = _context.Hospitals
            .OrderBy(x => x.Name)
            .ToList();

        return Ok(hospitals);
    }

    [HttpPut("hospital/{id}")]
    public IActionResult UpdateHospital(int id, CreateHospitalDto dto)
    {
        var hospital = _context.Hospitals.FirstOrDefault(x => x.Id == id);

        if (hospital == null)
            return NotFound("Hospital not found");

        hospital.Name = dto.Name;
        hospital.Address = dto.Address;
        hospital.City = dto.City;
        hospital.Phone = dto.Phone;
        _context.SaveChanges();

        return Ok(new
        {
            Message = "Hospital updated successfully"
        });
    }

    [HttpDelete("hospital/{id}")]
    public IActionResult DeleteHospital(int id)
    {
        var hospital = _context.Hospitals.FirstOrDefault(x => x.Id == id);

        if (hospital == null)
            return NotFound("Hospital not found");

        bool hasSessions = _context.HospitalSessions
            .Any(x => x.HospitalId == id);

        if (hasSessions)
        {
            return BadRequest(
                "Cannot delete hospital. Delete all hospital sessions first."
            );
        }

        _context.Hospitals.Remove(hospital);
        _context.SaveChanges();

        return Ok(new
        {
            Message = "Hospital deleted successfully"
        });
    }

    [HttpPut("product/{id}/image")]
    public async Task<IActionResult> UpdateProductImage(
    int id,
    IFormFile image)
    {
        var product = _context.Products.FirstOrDefault(x => x.Id == id);

        if (product == null)
            return NotFound("Product not found");

        if (image == null || image.Length == 0)
            return BadRequest("Image is required");

        var folder = Path.Combine(
            Directory.GetCurrentDirectory(),
            "wwwroot",
            "uploads",
            "products"
        );

        if (!Directory.Exists(folder))
            Directory.CreateDirectory(folder);

        var fileName =
            Guid.NewGuid() +
            Path.GetExtension(image.FileName);

        var path = Path.Combine(folder, fileName);

        using var stream = new FileStream(path, FileMode.Create);

        await image.CopyToAsync(stream);

        product.ImageUrl = "/uploads/products/" + fileName;

        _context.SaveChanges();

        return Ok(new
        {
            product.ImageUrl
        });
    }

    [HttpPut("product/{id}")]
    public IActionResult UpdateProduct(
    int id,
    UpdateProductDto dto)
    {
        var product = _context.Products
            .FirstOrDefault(x => x.Id == id);

        if (product == null)
            return NotFound();

        product.Name = dto.Name;
        product.Description = dto.Description;
        product.Price = dto.Price;
        product.Category = dto.Category;

        _context.SaveChanges();

        return Ok(product);
    }

    [HttpGet("contact-messages")]
    public IActionResult GetContactMessages()
    {
        var data = _context.Contacts
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.Email,
                x.Subject,
                x.Message,
                x.CreatedAt
            })
            .ToList();

        return Ok(data);
    }

    [HttpDelete("contact-message/{id}")]
    public IActionResult DeleteContactMessage(int id)
    {
        var msg = _context.Contacts.FirstOrDefault(x => x.Id == id);

        if (msg == null)
            return NotFound();

        _context.Contacts.Remove(msg);
        _context.SaveChanges();

        return Ok(new
        {
            Message = "Deleted successfully"
        });
    }

    [HttpGet("contact-message/{id}")]
    public IActionResult GetContactMessage(int id)
    {
        var msg = _context.Contacts.FirstOrDefault(x => x.Id == id);

        if (msg == null)
            return NotFound();

        return Ok(msg);
    }
}