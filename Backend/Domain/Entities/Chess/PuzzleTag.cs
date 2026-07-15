namespace Backend.Domain.Entities.Chess.Games;

public class PuzzleTag
{
    public int PuzzleId { get; set; }
    public Puzzle Puzzle { get; set; } = null!;

    public int TagId { get; set; }
    public Tag Tag { get; set; } = null!;
}