namespace HEALTHCARE.Models;
public class Ambulance
{
    public int Id { get; set; }
    public string DriverName { get; set; } = string.Empty;
    public string DriverPhone { get; set; } = string.Empty;
    public string VehicleNumber { get; set; } = string.Empty;
    public bool IsAvailable { get; set; } = true;
    public int UserId { get; set; }
    public AppUser User { get; set; } = null!;
    public string Type { get; set; } = "NonAC"; // NonAC | AC | Big
    public double Latitude { get; set; }
    public double Longitude { get; set; }

    // --- New fields added for the driver profile page ---
    public string LicenseNumber { get; set; } = string.Empty;
    public string BaseLocation { get; set; } = string.Empty;
    public double Rating { get; set; } = 5.0;
    public int YearsActive { get; set; } = 0;
    public bool Verified { get; set; } = false;
    public string? AvatarUrl { get; set; }
}