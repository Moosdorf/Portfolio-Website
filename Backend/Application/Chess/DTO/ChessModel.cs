using Backend.Domain.Entities.Chess.Games;

namespace Backend.Application.Chess.DTO;

public class ChessModel
{
    public int Id { get; set; }
    public string SessionId { get; set; }

    public ChessBoard ChessBoard { get; set; } = null!;

    public string GameType { get; set; }

    public string[] Players { get; set; } = []; // index 0 is always white, index 1 is always black

    public string[] Moves { get; set; } = [];

    public string[] FenList { get; set; } = [];

    public DateTime GameStarted { get; set; } // ISO 8601 timestamp

}
