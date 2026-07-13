namespace Backend.Application.Chess.DTO;

public class CreateChessModel
{
    public int BlackId { get; set; } = -1;
    public int WhiteId { get; set; } = -1;
    public string GameMode { get; set; } = null!;
}
