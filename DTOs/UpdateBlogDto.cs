using Microsoft.AspNetCore.Http;

namespace HEALTHCARE.DTOs;
public class UpdateBlogDto
{
    public string Title { get; set; } = "";
    public string Excerpt { get; set; } = "";
    public string Content { get; set; } = "";
    public string Category { get; set; } = "";
    public string AuthorName { get; set; } = "";
    public int ReadTimeMinutes { get; set; }
    public bool IsPublished { get; set; }

    public IFormFile? Image { get; set; }
}