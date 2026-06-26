namespace HEALTHCARE.Models;

public class Appointment
{
    public int Id { get; set; }

    public int PatientId { get; set; }

    public int DoctorId { get; set; }

    public int DoctorAvailabilityId { get; set; }

    public DateTime BookedAt { get; set; }

    public string Status { get; set; } = "Pending";

    // NEW
    public string PaymentStatus { get; set; } = "Pending";

    public decimal AdvanceAmount { get; set; }

    public string? RazorpayPaymentId { get; set; }

    // Navigation
    public AppUser? Patient { get; set; }

    public Doctor? Doctor { get; set; }

    public DoctorAvailability? DoctorAvailability { get; set; }
}