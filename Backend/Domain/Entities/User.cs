using System.ComponentModel.DataAnnotations;

namespace Domain.Entities;

public class User
{
    public int Id { get; set; } // unique. autoincremented by .net
    [Required]
    public string Username { get; set; } = string.Empty; // unique
    [Required]
    public string PasswordHash { get; set; } = string.Empty;
    [Required]
    public string Email { get; set; } = string.Empty; // unique
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
