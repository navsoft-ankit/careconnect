namespace HEALTHCARE.DTOs;
public class CreateAvailabilityDto
{
    public int HospitalId { get; set; }
    public int HospitalSessionId { get; set; }
    public TimeOnly FromTime { get; set; }
    public TimeOnly ToTime { get; set; }
    public int MaxPatients { get; set; }
}