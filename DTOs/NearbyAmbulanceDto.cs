namespace HEALTHCARE.Dtos;
public class NearbyAmbulanceDto
{
    public int Id { get; set; }
    public string DriverName { get; set; } = "";
    public string VehicleNumber { get; set; } = "";
    public string Type { get; set; } = "";
    public bool IsAvailable { get; set; }
    public string? Image { get; set; }
    public double DistanceKm { get; set; }
}