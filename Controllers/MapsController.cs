using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace HEALTHCARE.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class MapsController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    // Replace with your Geoapify API key
    private const string ApiKey = "53ffb39383f246fb81815bbc16144727";
    public MapsController(IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search(string q)
    {
        if (string.IsNullOrWhiteSpace(q))
            return BadRequest();
        var client = _httpClientFactory.CreateClient();
        var url =
            $"https://api.geoapify.com/v1/geocode/autocomplete" +
            $"?text={Uri.EscapeDataString(q)}" +
            $"&limit=5" +
            $"&apiKey={ApiKey}";

        var response = await client.GetAsync(url);
        if (!response.IsSuccessStatusCode)
        {
            var err = await response.Content.ReadAsStringAsync();
            return StatusCode((int)response.StatusCode, err);
        }

        var json = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(json);
        var result = new List<object>();
        foreach (var feature in doc.RootElement
                     .GetProperty("features")
                     .EnumerateArray())
        {
            var coords = feature
                .GetProperty("geometry")
                .GetProperty("coordinates");
            result.Add(new
            {
                display_name = feature
                    .GetProperty("properties")
                    .GetProperty("formatted")
                    .GetString(),
                lat = coords[1].GetDouble(),
                lon = coords[0].GetDouble()
            });
        }
        return Ok(result);
    }
}