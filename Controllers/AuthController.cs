using Microsoft.AspNetCore.Mvc;
using HEALTHCARE.Data;
using HEALTHCARE.DTOs;
using HEALTHCARE.Models;
using HEALTHCARE.Services;

namespace HEALTHCARE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly TokenService _tokenService;

    public AuthController(AppDbContext context, TokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
    }

    [HttpPost("register")]
    public IActionResult Register(RegisterDto dto)
    {
        if (_context.Users.Any(x => x.Email == dto.Email))
        {
            return BadRequest("Email already exists");
        }

        var user = new AppUser
        {
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash = dto.Password,
            Role = "Patient"
        };

        _context.Users.Add(user);
        _context.SaveChanges();

        return Ok(new
        {
            Message = "Registration successful"
        });
    }

    [HttpPost("login")]
    public IActionResult Login(LoginDto dto)
    {
        var email = dto.Email.Trim().ToLower();
        var password = dto.Password.Trim();

        var user = _context.Users
            .FirstOrDefault(x =>
                x.Email.Trim().ToLower() == email);

        if (user == null)
        {
            return Unauthorized(new
            {
                Message = "Invalid email or password"
            });
        }

        if (user.PasswordHash.Trim() != password)
        {
            return Unauthorized(new
            {
                Message = "Invalid email or password"
            });
        }

        var token = _tokenService.CreateToken(user);

        return Ok(new
        {
            Token = token,
            UserId = user.Id,
            Name = user.FullName,
            Email = user.Email,
            Role = user.Role
        });
    }
}