namespace HEALTHCARE.Models;
public class Appointment
{
    public int Id { get; set; }

    public int PatientId { get; set; }

    public int DoctorId { get; set; }

    public int DoctorAvailabilityId { get; set; }

    public DateTime BookedAt { get; set; } = DateTime.UtcNow;

    public string Status { get; set; } = "Pending";
}