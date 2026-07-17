using Backend.Domain.Entities.Chess.Games;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Backend.Domain.Entities.Users;

public class User
{
    public int Id { get; set; } // unique. autoincremented by .net
    [Required]
    public string Username { get; set; } = string.Empty; // unique
    [Required]
    [JsonIgnore]
    public string PasswordHash { get; set; } = string.Empty;
    [Required]
    public string Email { get; set; } = string.Empty; // unique
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int PuzzleRating { get; set; } = 1500;

    [JsonIgnore] // to avoid include loops
    public List<ChessGame> GamesAsWhite { get; set; }
    [JsonIgnore]
    public List<ChessGame> GamesAsBlack { get; set; }
}
