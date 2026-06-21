using Backend.Domain.Entities.Users;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations;

namespace Backend.Domain.Entities.Chess.Games;

public class ChessGame
{
    public int Id { get; set; }
    [Required]
    public User White {  get; set; }
    public int WhiteId {  get; set; }
    [Required]
    public User Black { get; set; }
    public int BlackId { get; set; }
    public int Moves { get; set; } = 0;
    public List<string> FenList { get; set; } = new List<string>();
    public DateTime GameStarted { get; set; } = DateTime.UtcNow;
    public string CurrentState { get; set; } = "";

    public ChessBoard ChessBoard => FenList.Count > 0
        ? new ChessBoard(FEN: FenList.Last())
        : new ChessBoard();
}
