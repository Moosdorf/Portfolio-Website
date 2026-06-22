namespace Backend.Application.Chess.DTO;

public class ChessModel
{
    public int Id { get; set; }
    public string SessionId { get; set; }
    public Piece[][] Chessboard { get; set; } = null!;
    public bool IsWhite { get; set; }
    public string[] Players { get; set; } = [];
    public string CurrentPlayer { get; set; } = string.Empty;
    public bool Check { get; set; } = false;
    public bool CheckMate { get; set; } = false;
    public List<string> BlockCheckPositions { get; set; } = [];
    public string FEN { get; set; } = "";
    public string LastMove { get; set; } = "";
    public bool GameDone { get; set; } = false;

}
