
using Backend.Application.Chess.DTO;


namespace Backend.Application.Chess.Services;

public interface IPuzzleDataService
{
    PuzzleDTO GetRandomPuzzle();
    PuzzleDTO GetPuzzle(int rating, string theme);

}
