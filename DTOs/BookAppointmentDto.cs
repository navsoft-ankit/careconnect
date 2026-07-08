namespace HEALTHCARE.DTOs;
public class BookAppointmentDto
{
    public int DoctorAvailabilityId { get; set; }
    public string? PaymentMethod { get; set; }
    public string? RazorpayPaymentId { get; set; }
    public bool UseRefundBalance { get; set; }
    // Patient Details
    public string PatientName { get; set; } = "";
    public string PatientPhone { get; set; } = "";
    public string PatientEmail { get; set; } = "";
    public DateTime? PatientDob { get; set; }
    public string Gender { get; set; } = "";
    public string BloodGroup { get; set; } = "";
    public string Address { get; set; } = "";
    public string Relationship { get; set; } = "Self";
}