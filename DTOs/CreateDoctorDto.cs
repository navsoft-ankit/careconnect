namespace HEALTHCARE.DTOs;

public class CreateDoctorDto
{
    public string FullName { get; set; }
    public string Email { get; set; }
    public string Password { get; set; }
    public string Specialization { get; set; }
    public string HospitalName { get; set; }
    public decimal Fee { get; set; }
    public string? About { get; set; }
}