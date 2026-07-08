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
    public decimal Fare { get; set; }
    public double PickupLat { get; set; }
    public double PickupLng { get; set; }
    public double DestinationLat { get; set; }
    public double DestinationLng { get; set; }
    public string VehicleType { get; set; } = "NonAC";
    public double DistanceKm { get; set; }

}