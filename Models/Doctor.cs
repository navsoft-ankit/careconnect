namespace HEALTHCARE.Models;

public class Doctor
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string name{get; set;}
    public AppUser User { get; set; }
    public string Specialization { get; set; }
    public string HospitalName { get; set; }
    public decimal Fee { get; set; }
    public string? About { get; set; }
    public string? ImageUrl { get; set; }

}