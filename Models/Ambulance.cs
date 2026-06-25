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
}