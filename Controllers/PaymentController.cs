using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Razorpay.Api;
using HEALTHCARE.DTOs;
using System.Security.Cryptography;
using System.Text;

namespace HEALTHCARE.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PaymentController : ControllerBase
{
    private readonly IConfiguration _config;
    public PaymentController(IConfiguration config)
    {
        _config = config;
    }

    [HttpPost("create-order")]
    public IActionResult CreateOrder([FromBody] CreateRazorpayOrderDto dto)
    {
        var keyId = _config["Razorpay:KeyId"];
        var keySecret = _config["Razorpay:KeySecret"];
        var client = new RazorpayClient(keyId, keySecret);
        var options = new Dictionary<string, object>
        {
            { "amount", (int)(dto.Amount * 100) }, // rupees -> paise
            { "currency", dto.Currency ?? "INR" },
            { "receipt", $"rcpt_{Guid.NewGuid():N}".Substring(0, 20) },
            { "payment_capture", 1 }
        };

        Order order = client.Order.Create(options);

        return Ok(new
        {
            orderId = order["id"].ToString(),
            amount = (int)(dto.Amount * 100),
            currency = dto.Currency ?? "INR",
            razorpayKeyId = keyId
        });
    }

    [HttpPost("verify")]
    public IActionResult VerifyPayment([FromBody] VerifyRazorpayPaymentDto dto)
    {
        var keySecret = _config["Razorpay:KeySecret"];
        var payload = $"{dto.razorpay_order_id}|{dto.razorpay_payment_id}";
        var generatedSignature = ComputeHmacSha256(payload, keySecret!);
        if (generatedSignature != dto.razorpay_signature)
            return BadRequest("Payment verification failed — signature mismatch");

        return Ok(new { verified = true });
    }
    private static string ComputeHmacSha256(string data, string secret)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        return Convert.ToHexString(hash).ToLower();
    }
}