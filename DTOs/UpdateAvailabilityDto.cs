namespace HEALTHCARE.DTOs;
public class UpdateAvailabilityDto
{
    public int Id { get; set; }
    public int HospitalId { get; set; }
    public int HospitalSessionId { get; set; }
    public TimeOnly FromTime { get; set; }
    public TimeOnly ToTime { get; set; }
    public DateOnly Date { get; set; }
    public int MaxPatients { get; set; } = 1;
}