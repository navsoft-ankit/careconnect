namespace HEALTHCARE.Models;
public class Appointment
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public int DoctorId { get; set; }
    public int DoctorAvailabilityId { get; set; }
    public DateTime BookedAt { get; set; }
    public string Status { get; set; } = "Pending";
    public string PaymentStatus { get; set; } = "Pending";
    public decimal AdvanceAmount { get; set; }
    public decimal WalletUsed { get; set; } = 0;
    public string? RazorpayPaymentId { get; set; }
    
    // Navigation
    public AppUser? Patient { get; set; }
    public Doctor? Doctor { get; set; }
    public DoctorAvailability? DoctorAvailability { get; set; }
    public string PatientName { get; set; } = "";
    public string PatientPhone { get; set; } = "";
    public string PatientEmail { get; set; } = "";
    public DateTime? PatientDob { get; set; }
    public string Gender { get; set; } = "";
    public string BloodGroup { get; set; } = "";
    public string Address { get; set; } = "";
    public string Relationship { get; set; } = "Self";
    public bool IsReviewed { get; set; } = false;
}