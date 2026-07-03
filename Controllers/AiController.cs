using System.Text;
using System.Text.Json;
using HEALTHCARE.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace HEALTHCARE.Controllers;

[ApiController]
[Route("api/ai")]
public class AiController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly HttpClient _httpClient;

    public AiController(IConfiguration config)
    {
        _config = config;
        _httpClient = new HttpClient();
    }

    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] ChatRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Message))
            return BadRequest(new { message = "Message is required." });

        var message = dto.Message.Trim().ToLower();

        // =========================
        // WEBSITE NAVIGATION INTENTS
        // =========================

        if (message.Contains("appointment"))
        {
            return Ok(new AiResponseDto
            {
                Reply = "Opening your appointments...",
                Action = "appointments"
            });
        }

        if (message.Contains("doctor"))
        {
            return Ok(new AiResponseDto
            {
                Reply = "Opening doctors page...",
                Action = "doctors"
            });
        }

        if (message.Contains("ambulance"))
        {
            return Ok(new AiResponseDto
            {
                Reply = "Opening ambulance booking...",
                Action = "ambulance"
            });
        }

        if (message.Contains("prescription"))
        {
            return Ok(new AiResponseDto
            {
                Reply = "Opening prescriptions...",
                Action = "prescriptions"
            });
        }

        if (message.Contains("medicine"))
        {
            return Ok(new AiResponseDto
            {
                Reply = "Opening medicine store...",
                Action = "medicine"
            });
        }

        if (message.Contains("profile"))
        {
            return Ok(new AiResponseDto
            {
                Reply = "Opening profile...",
                Action = "profile"
            });
        }

        if (message.Contains("wallet"))
        {
            return Ok(new AiResponseDto
            {
                Reply = "Opening your wallet...",
                Action = "wallet"
            });
        }

        if (message.Contains("dashboard"))
        {
            return Ok(new AiResponseDto
            {
                Reply = "Opening dashboard...",
                Action = "dashboard"
            });
        }

        // =========================
        // GEMINI AI
        // =========================

        var apiKey = _config["Gemini:ApiKey"];

        var prompt = $"""
You are CareConnect AI Assistant.

About CareConnect:

CareConnect is a Healthcare Management System.

Patient Features:
- Register
- Login
- Doctor Booking
- Ambulance Booking
- Medicine Ordering
- Prescription Download
- Wallet
- Profile

Doctor Features:
- Dashboard
- Availability
- Appointments
- Prescription Writing
- Profile

Hospital Features:
- Manage Sessions
- Manage Doctors

Rules:

- Be friendly.
- Answer briefly.
- Give only general health information.
- Never prescribe medicines.
- Never confirm a diagnosis.
- Recommend consulting a doctor when appropriate.
- For emergencies such as chest pain, stroke symptoms, severe bleeding, breathing difficulty or unconsciousness, advise immediate emergency care.

User Question:

{dto.Message}
""";

        var body = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new
                        {
                            text = prompt
                        }
                    }
                }
            }
        };

        var json = JsonSerializer.Serialize(body);

        var content = new StringContent(
            json,
            Encoding.UTF8,
            "application/json");

        var response = await _httpClient.PostAsync(
            $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={apiKey}",
            content);

        if (!response.IsSuccessStatusCode)
        {
            var err = await response.Content.ReadAsStringAsync();

            return BadRequest(new
            {
                message = "Gemini API Error",
                error = err
            });
        }

        var result = await response.Content.ReadAsStringAsync();

        using var doc = JsonDocument.Parse(result);

        var text = doc.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();

        return Ok(new AiResponseDto
        {
            Reply = text ?? "",
            Action = "none"
        });
    }
}