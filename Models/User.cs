public class AppUser
{
    public int Id { get; set; }

    public string FullName { get; set; } = "";

    public string Email { get; set; } = "";

    public string PasswordHash { get; set; } = "";

    public string Role { get; set; } = "";

    public decimal RefundBalance { get; set; } = 0;

    public string? Phone { get; set; }

    public string? Gender { get; set; }

    public DateTime? Dob { get; set; }

    public string? BloodGroup { get; set; }

    public string? Address { get; set; }

    public string? City { get; set; }

    public string? State { get; set; }

    public string? Country { get; set; }

    public string? PinCode { get; set; }

    public string? AvatarUrl { get; set; }
}