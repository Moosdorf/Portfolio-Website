using System.ComponentModel.DataAnnotations;

namespace Backend.Application.Chess.DTO;

public class StartChessGameRequest
{
    [Required]
    public bool BotGame { get; set; }

    [Required]
    public int WhiteId { get; set; }

    [Required]
    public int BlackId { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; }
}
