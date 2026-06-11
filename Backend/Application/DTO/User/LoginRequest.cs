using System.ComponentModel.DataAnnotations;

namespace Backend.Application.DTO.User;

public class LoginRequest
{
    [Required]
    public string Username { get; set; }

    [Required]
    public string Password { get; set; }
}
