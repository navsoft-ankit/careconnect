namespace HEALTHCARE.Models;
public class Order
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public decimal TotalAmount { get; set; }

    public DateTime OrderDate { get; set; } = DateTime.UtcNow;

    public string Status { get; set; } = "Pending";
}