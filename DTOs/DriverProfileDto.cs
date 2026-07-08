namespace HEALTHCARE.DTOs;
public class DriverProfileDto
{
    public string DriverName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string DriverPhone { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;          // NonAC | AC | Big
    public string VehicleNumber { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public string BaseLocation { get; set; } = string.Empty;
    public bool IsAvailable { get; set; }
    public double Rating { get; set; }
    public int TotalRides { get; set; }
    public int YearsActive { get; set; }
    public bool Verified { get; set; }
    public string? AvatarUrl { get; set; }
}

public class UpdateDriverProfileDto
{
    public string DriverName { get; set; } = string.Empty;
    public string DriverPhone { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string VehicleNumber { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public string BaseLocation { get; set; } = string.Empty;
}

public class UpdateDto
{
    public bool IsAvailable { get; set; }
}