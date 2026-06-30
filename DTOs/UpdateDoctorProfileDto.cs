namespace HEALTHCARE.DTOs;

public class UpdateDoctorProfileDto
{
    public string Name { get; set; }

    public string Email { get; set; }

    public string Specialization { get; set; }

    public string HospitalName { get; set; }

    public decimal Fee { get; set; }

    public string? About { get; set; }
}