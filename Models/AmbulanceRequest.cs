namespace HEALTHCARE.Models;

public class AmbulanceRequest
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int AmbulanceId { get; set; }

    public string PickupLocation { get; set; }

    public string DestinationLocation { get; set; }

    public DateTime RequestTime { get; set; } = DateTime.UtcNow;

    public string Status { get; set; } = "Pending";
}