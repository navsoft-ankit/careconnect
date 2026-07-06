namespace HEALTHCARE.Models;

public class Blog
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string Excerpt { get; set; } = "";
    public string Content { get; set; } = "";
    public string Category { get; set; } = "";
    public string AuthorName { get; set; } = "";
    public string? Image { get; set; }
    public int ReadTimeMinutes { get; set; }
    public bool IsPublished { get; set; } = true;
    public DateTime PublishedAt { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}