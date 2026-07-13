namespace Backend.Application.Chess.DTO;

public class MoveModel
{
    public int GameId { get; set; }
    public string User { get; set; }

    public string Move { get; set; } = null!;
    public char? Promotion { get; set; } = null;
}
