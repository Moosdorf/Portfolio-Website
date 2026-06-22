using System.ComponentModel.DataAnnotations;

namespace Backend.Application.Chess.DTO;

public class StartChessGameRequest
{
    [Required]
    public string GameType { get; set; }

    [Required]
    public int WhiteId { get; set; }

    [Required]
    public int BlackId { get; set; }

}
