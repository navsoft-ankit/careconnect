namespace HEALTHCARE.DTOs;
public class ApproveDoctorSlotDto
{
    public int RequestId { get; set; }
    public bool Approve { get; set; }
    public string? AdminRemark { get; set; }
}