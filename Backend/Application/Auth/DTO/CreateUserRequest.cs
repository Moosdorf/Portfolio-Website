using System.ComponentModel.DataAnnotations;

namespace Backend.Application.Auth.DTO;

public class CreateUserRequest
{
    [Required]
    public string Username { get; set; }

    [Required]
    public string Password { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; }
}
