using System;
using System.Linq;
using System.Threading.Tasks;
using HEALTHCARE.Data;
using HEALTHCARE.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using HEALTHCARE.DTOs;

namespace HEALTHCARE.Controllers
{
    [ApiController]
    public class BlogController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BlogController(AppDbContext context)
        {
            _context = context;
        }

        // ───────────────────────── PATIENT (public read) ─────────────────────────

        // GET /api/patient/blogs
        [HttpGet("api/patient/blogs")]
        public async Task<IActionResult> GetBlogs([FromQuery] string? category, [FromQuery] string? search)
        {
            var query = _context.Blogs
                .Where(b => b.IsPublished)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(category) && category != "All")
                query = query.Where(b => b.Category == category);

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.ToLower();
                query = query.Where(b =>
                    b.Title.ToLower().Contains(term) ||
                    b.Excerpt.ToLower().Contains(term));
            }

            var blogs = await query
                .OrderByDescending(b => b.PublishedAt)
                .Select(b => new
                {
                    b.Id,
                    b.Title,
                    b.Excerpt,
                    b.Category,
                    b.Image,
                    b.AuthorName,
                    b.ReadTimeMinutes,
                    b.PublishedAt,
                })
                .ToListAsync();

            return Ok(blogs);
        }

        // GET /api/patient/blogs/{id}
        [HttpGet("api/patient/blogs/{id}")]
        public async Task<IActionResult> GetBlogById(int id)
        {
            var blog = await _context.Blogs
                .Where(b => b.Id == id && b.IsPublished)
                .FirstOrDefaultAsync();

            if (blog == null)
                return NotFound("Article not found.");

            // Simple "related articles" — same category, excluding this one.
            var related = await _context.Blogs
                .Where(b => b.IsPublished && b.Category == blog.Category && b.Id != id)
                .OrderByDescending(b => b.PublishedAt)
                .Take(3)
                .Select(b => new
                {
                    b.Id,
                    b.Title,
                    b.Image,
                    b.Category,
                    b.ReadTimeMinutes,
                })
                .ToListAsync();

            return Ok(new
            {
                blog.Id,
                blog.Title,
                blog.Excerpt,
                blog.Content,
                blog.Category,
                blog.Image,
                blog.AuthorName,
                blog.ReadTimeMinutes,
                blog.PublishedAt,
                Related = related,
            });
        }

        // ───────────────────────── ADMIN (manage posts) ─────────────────────────

        // GET /api/admin/blogs  — includes unpublished/drafts
        [HttpGet("api/admin/blogs")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllBlogsForAdmin()
        {
            var blogs = await _context.Blogs
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            return Ok(blogs);
        }

        // POST /api/admin/blogs
        [HttpPost("api/admin/blogs")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateBlog([FromForm] CreateBlogDto dto)
        {
            string? imagePath = null;

            if (dto.Image != null)
            {
                var folder = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "wwwroot",
                    "uploads",
                    "blogs"
                );

                if (!Directory.Exists(folder))
                    Directory.CreateDirectory(folder);

                var fileName = Guid.NewGuid() + Path.GetExtension(dto.Image.FileName);
                var fullPath = Path.Combine(folder, fileName);
                using var stream = new FileStream(fullPath, FileMode.Create);

                await dto.Image.CopyToAsync(stream);

                imagePath = "/uploads/blogs/" + fileName;
            }

            var blog = new Blog
            {
                Title = dto.Title,
                Excerpt = dto.Excerpt,
                Content = dto.Content,
                Category = dto.Category,
                AuthorName = dto.AuthorName,
                ReadTimeMinutes = dto.ReadTimeMinutes,
                IsPublished = dto.IsPublished,
                Image = imagePath,
                CreatedAt = DateTime.UtcNow,
                PublishedAt = DateTime.UtcNow
            };

            _context.Blogs.Add(blog);
            await _context.SaveChangesAsync();

            return Ok(blog);
        }

        // PUT /api/admin/blogs/{id}
        [HttpPut("api/admin/blogs/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateBlog(int id, [FromForm] UpdateBlogDto dto)
        {
            var blog = await _context.Blogs.FindAsync(id);

            if (blog == null)
                return NotFound();

            blog.Title = dto.Title;
            blog.Excerpt = dto.Excerpt;
            blog.Content = dto.Content;
            blog.Category = dto.Category;
            blog.AuthorName = dto.AuthorName;
            blog.ReadTimeMinutes = dto.ReadTimeMinutes;
            blog.IsPublished = dto.IsPublished;

            if (dto.Image != null)
            {
                var folder = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "wwwroot",
                    "uploads",
                    "blogs"
                );

                if (!Directory.Exists(folder))
                    Directory.CreateDirectory(folder);

                var fileName = Guid.NewGuid() + Path.GetExtension(dto.Image.FileName);
                var fullPath = Path.Combine(folder, fileName);
                using var stream = new FileStream(fullPath, FileMode.Create);

                await dto.Image.CopyToAsync(stream);

                blog.Image = "/uploads/blogs/" + fileName;
            }

            await _context.SaveChangesAsync();

            return Ok(blog);
        }

        // DELETE /api/admin/blogs/{id}
        [HttpDelete("api/admin/blogs/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteBlog(int id)
        {
            var blog = await _context.Blogs.FindAsync(id);
            if (blog == null)
                return NotFound("Article not found.");

            _context.Blogs.Remove(blog);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Article deleted." });
        }

        // PATCH api/admin/blogs/{id}/toggle
        [HttpPatch("api/admin/blogs/{id}/toggle")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> TogglePublish(int id)
        {
            var blog = await _context.Blogs.FindAsync(id);

            if (blog == null)
                return NotFound();

            blog.IsPublished = !blog.IsPublished;

            if (blog.IsPublished)
                blog.PublishedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(blog);
        }
    }

}