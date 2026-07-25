
using Backend.Application.Chess.DTO;
using Backend.Domain.Entities.Chess;


namespace Backend.Application.Chess.Services;

public interface IPuzzleDataService
{
    PuzzleDTO GetRandomPuzzle();
    PuzzleDTO GetPuzzle(int rating, string theme);
    PuzzleDTO? GetRankedPuzzle(int rating);
    int AdjustPuzzleRating(string username, bool successful);
    bool IsPuzzleSolved(string puzzleId, string[] moves);

}
