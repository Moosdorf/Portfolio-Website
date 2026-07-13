using Backend.Domain.Entities.Users;

namespace Backend.Domain.Entities.Chess.Games;


public enum GameResult
{
    WhiteWin,
    BlackWin,
    Draw,
    Ongoing
}

public class ChessGame
{
    public int Id { get; set; }
    public string GameType { get; set; }

    public int WhiteId { get; set; }
    public string WhiteUsername { get; set; } 
    public User WhitePlayer { get; set; } = null!; // remove null when ready
    public int BlackId { get; set; }
    public string BlackUsername { get; set; }
    public User BlackPlayer { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public List<Move> Moves { get; set; } = []; 
    public String CurrentFEN { get; set; } = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    public GameResult Result { get; set; } = GameResult.Ongoing;
}