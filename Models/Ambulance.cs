namespace HEALTHCARE.Models;

public class Ambulance
{
    public int Id { get; set; }

    public string DriverName { get; set; }

    public string DriverPhone { get; set; }

    public string VehicleNumber { get; set; }

    public bool IsAvailable { get; set; } = true;

    public int UserId { get; set; }

    public AppUser User { get; set; }
    public string Type { get; set; } = "NonAC"; // NonAC | AC | Big
    public double Latitude { get; set; }
    public double Longitude { get; set; }   
}