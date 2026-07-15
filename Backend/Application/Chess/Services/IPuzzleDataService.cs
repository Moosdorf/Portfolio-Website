
using Backend.Application.Chess.DTO;
using Backend.Domain.Entities.Chess;


namespace Backend.Application.Chess.Services;

public interface IPuzzleDataService
{
    PuzzleDTO GetRandomPuzzle();
    PuzzleDTO GetPuzzle(int rating, string theme);
}
