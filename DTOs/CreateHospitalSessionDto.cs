namespace HEALTHCARE.DTOs;
public class CreateHospitalSessionDto
{
    public int HospitalId { get; set; }
    public string Day { get; set; }
    public DateOnly Date { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public string PlaceToVisit { get; set; } = "";
}