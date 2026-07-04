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
        // OPENROUTER AI
        // =========================

        var apiKey = _config["Groq:ApiKey"];

        var body = new
        {
            model = "llama-3.3-70b-versatile",
            messages = new object[]
            {
        new
        {
            role = "system",
            content = """
                You are CareConnect AI Assistant.

                CareConnect is a Healthcare Management System.

                Rules:
                - Be friendly.
                - Answer briefly.
                - Never prescribe medicines.
                - Never confirm a diagnosis.
                - Recommend consulting a doctor when appropriate.
                - For emergencies such as chest pain, stroke symptoms, severe bleeding,
                breathing difficulty or unconsciousness,
                advise immediate emergency care.
                """
        },
        new
        {
            role = "user",
            content = dto.Message
        }
            },
            temperature = 0.4,
            max_tokens = 500
        };

        var request = new HttpRequestMessage(
            HttpMethod.Post,
            "https://api.groq.com/openai/v1/chat/completions");

        request.Headers.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);

        request.Content = new StringContent(
            JsonSerializer.Serialize(body),
            Encoding.UTF8,
            "application/json");

        var response = await _httpClient.SendAsync(request);

        var responseText = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
        {
            return BadRequest(new
            {
                message = "Groq API Error",
                error = responseText
            });
        }

        using var doc = JsonDocument.Parse(responseText);

        var reply = doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString();

        return Ok(new AiResponseDto
        {
            Reply = reply ?? "",
            Action = "none"
        });
    }
}