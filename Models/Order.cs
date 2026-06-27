namespace HEALTHCARE.Models;
public class Order
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "Pending";

    public string DeliveryAddress { get; set; } = string.Empty;
    public string PaymentMode { get; set; } = "COD"; // "COD" or "Online"
    public string PaymentStatus { get; set; } = "Pending"; // "Pending" | "Paid" | "Failed"
    public string? RazorpayPaymentId { get; set; }
}