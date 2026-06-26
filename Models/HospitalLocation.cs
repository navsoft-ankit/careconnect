namespace HEALTHCARE.Models;

public class HospitalLocation
{
    public int Id { get; set; }
    public string Name { get; set; } = "Lakeview Hospital";
    public double Latitude { get; set; }
    public double Longitude { get; set; }
}