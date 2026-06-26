namespace HEALTHCARE.DTOs;

public class CreateRazorpayOrderDto
{
    public decimal Amount { get; set; }
    public string? Currency { get; set; }
    public string? Description { get; set; }
}

public class VerifyRazorpayPaymentDto
{
    public string razorpay_order_id { get; set; } = string.Empty;
    public string razorpay_payment_id { get; set; } = string.Empty;
    public string razorpay_signature { get; set; } = string.Empty;
}