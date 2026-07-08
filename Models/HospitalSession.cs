namespace HEALTHCARE.Models;
public class HospitalSession
{
    public int Id { get; set; }
    public int HospitalId { get; set; }
    public Hospital Hospital { get; set; }
    public string Day { get; set; } = "";
    public DateOnly Date { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public string PlaceToVisit { get; set; } = "";
    public bool IsActive { get; set; } = true;
}