using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Backend.Domain.Entities.Chess.Games;

public class Move
{
    public int Id { get; set; }

    [Required]
    public string MoveString { get; set; } = ""; // for example: "e4,e5"
    [Required]
    public string FEN { get; set; } = ""; // 
    public int ChessGameId { get; set; }

    [JsonIgnore] // prevents recursion
    public ChessGame ChessGame { get; set; } = null!;
}
