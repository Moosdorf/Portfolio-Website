using Backend.Application.Chess.DTO;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;


namespace Backend.Application.Chess.Services;

public class PuzzleDataService : IPuzzleDataService
{
    private AppDbContext _db;

    public PuzzleDataService(AppDbContext context)
    {
        _db = context;
    }

    public PuzzleDTO GetPuzzle(int rating, string theme)
    {
        throw new NotImplementedException();
    }
    private static readonly Random _random = new Random();


    public PuzzleDTO GetRandomPuzzle()
    {
        // Step 1: get the total count of rows in PuzzleIndex
        var count = _db.Puzzles.Count();
        if (count == 0) return null; // no puzzles available

        // Step 2: pick a random row
        var randomRow = _random.Next(1, count + 1);

        // Step 3: get the PuzzleId for that random row
        var puzzleId = _db.Puzzles
            .Where(p => p.Id == randomRow)
            .Select(p => p.PuzzleId)
            .FirstOrDefault();

        if (puzzleId == null) return null; // safety check

        // Step 4: load the Puzzle with its PuzzleTags and Tags eagerly
        var puzzle = _db.Puzzles
            .Where(p => p.PuzzleId == puzzleId)
            .FirstOrDefault();

        if (puzzle == null) return null;

        // Step 5: map to DTO 
        var dto = new PuzzleDTO
        {
            PuzzleId = puzzle.PuzzleId,
            Chessboard = new ChessBoard(puzzle.FEN),
            FEN = puzzle.FEN,
            Rating = puzzle.Rating,
            RatingDeviation = puzzle.RatingDeviation,
            Popularity = puzzle.Popularity,
            NbPlays = puzzle.NbPlays,
            GameUrl = puzzle.GameUrl,
            OpeningTags = puzzle.OpeningTags.Split(" ").Select(x => x.Replace("_", " ")).ToList(),
            Moves = puzzle.Moves.Split(" ").Select(x => x.Insert(2, ",")).ToList()

        };

        return dto;
    }


}
