namespace HEALTHCARE.DTOs;
public class CreateDoctorSlotRequestDto
{
    public int HospitalId { get; set; }
    public int HospitalSessionId { get; set; }
    public DateTime RequestedFrom { get; set; }
    public DateTime RequestedTo { get; set; }
    public int MaxPatients { get; set; }
    public string? Reason { get; set; }
}