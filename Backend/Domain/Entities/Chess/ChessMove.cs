namespace Backend.Domain.Entities.Chess;

public class ChessMove
{
    public string Move { get; set; } = null!;
    public char? Promotion { get; set; } = null;

}
