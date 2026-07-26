namespace Backend.Application.Chess.DTO;

public class PuzzleAttemptDTO
{
    public string PuzzleId { get; set; }   
    public bool Solved { get; set; }
    public bool HintUsed { get; set; }
    public bool Revealed { get; set; }
    public int RatingBefore { get; set; }
    public int RatingAfter { get; set; }
    public DateTime AttemptedAt { get; set; }
}
