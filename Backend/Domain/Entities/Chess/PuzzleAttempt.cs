using Backend.Domain.Entities.Users;

namespace Backend.Domain.Entities.Chess.Games;

public class PuzzleAttempt
{
    public int Id { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public string PuzzleId { get; set; }  
    public Puzzle Puzzle { get; set; } = null!;

    public bool Solved { get; set; }
    public bool HintUsed { get; set; }
    public bool Revealed { get; set; }

    public string[] MovesMade { get; set; } = []; 

    public int RatingBefore { get; set; }
    public int RatingAfter { get; set; }

    public DateTime AttemptedAt { get; set; } = DateTime.UtcNow;
}