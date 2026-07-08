namespace HEALTHCARE.DTOs;
public class PlaceOrderDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public string DeliveryAddress { get; set; } = string.Empty;
    public string PaymentMode { get; set; } = "COD"; // "COD" or "Online"
    public string? RazorpayPaymentId { get; set; } // required when PaymentMode == "Online"
}