namespace HEALTHCARE.Models;

public class DoctorAvailability
{
    public int Id { get; set; }

    public int DoctorId { get; set; }
    public Doctor? Doctor { get; set; }

    // Nullable FK
    public int? HospitalId { get; set; }
    public Hospital? Hospital { get; set; }

    // Nullable FK
    public int? HospitalSessionId { get; set; }
    public HospitalSession? HospitalSession { get; set; }
    public DateTime AvailableFrom { get; set; }
    public DateTime AvailableTo { get; set; }
    public string? Place { get; set; }
    public int MaxPatients { get; set; } = 1;
    public int BookedCount { get; set; } = 0;
    public bool IsBooked { get; set; } = false;
    public bool IsApproved { get; set; } = false;
    public string Status { get; set; } = "Pending";
    public bool IsActive { get; set; } = true;
}