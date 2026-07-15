namespace Backend.Domain.Entities.Chess;

public class PuzzleMove
{
    public string PuzzleId { get; set; }
    public string Move { get; set; }
    public string FEN { get; set; }
}
