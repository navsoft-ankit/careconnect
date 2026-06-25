namespace HEALTHCARE.Models;

public class DoctorAvailability
{
    public int Id { get; set; }

    public int DoctorId { get; set; }
    public Doctor Doctor { get; set; }

    public DateTime AvailableFrom { get; set; }
    public DateTime AvailableTo { get; set; }

    public bool IsBooked { get; set; } = false;
}