namespace Backend.Application.Chess.DTO
{
    public class ChessPuzzleResult
    {
        public string PuzzleId { get; set; } = "";
        public string[] MovesMade { get; set; } = [];
        public bool HintUsed { get; set; }
        public bool PuzzleRevealed { get; set; }
    }
}
