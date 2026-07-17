using Backend.Application.Chess.DTO;
using Backend.Domain.Entities.Chess;
using Backend.Domain.Entities.Chess.Games;
using DataLayer.csv_scripts;
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
        var randomOffset = _random.Next(0, count);

        // Step 3: get the PuzzleId for that random row
        var puzzle = _db.Puzzles
            .OrderBy(p => p.Id)
            .Skip(randomOffset)
            .Include(p => p.PuzzleTags)
            .ThenInclude(pt => pt.Tag)
            .FirstOrDefault();

        if (puzzle == null) return null;


        return CreatePuzzleDTO(puzzle);
    }

    public PuzzleDTO GetRankedPuzzle(int rating)
    {
        int minRating = rating - 50;
        int maxRating = rating + 50;

        var query = _db.Puzzles
            .Where(p => p.Rating >= minRating && p.Rating <= maxRating);

        var count = query.Count();
        if (count == 0) return null; // no puzzles in range

        var randomOffset = _random.Next(0, count);

        var puzzle = query
            .OrderBy(p => p.Id) // stable, indexed order for Skip to work correctly
            .Skip(randomOffset)
            .Take(1)
            .Include(p => p.PuzzleTags)
                .ThenInclude(pt => pt.Tag)
            .FirstOrDefault();

        return puzzle == null ? null : CreatePuzzleDTO(puzzle);
    }

    public PuzzleDTO CreatePuzzleDTO(Puzzle puzzle)
    {
        var tagNames = puzzle.PuzzleTags.Select(pt => pt.Tag.Name).ToList();

        // create the puzzle (before start position)
        var chessBoard = new ChessBoard(puzzle.FEN);

        // make move creating the initial position
        var moves = puzzle.Moves.Split(" ").Select(x => x.Insert(2, ",")).ToList();

        List<ChessBoard> possibleStates = new List<ChessBoard>();
        possibleStates.Add(new ChessBoard(chessBoard.FEN));

        // Step 6: create move list
        for (int i = 0; i < moves.Count(); i++)
        {
            chessBoard.Move(new MoveModel { Move = moves[i] });
            var tempBoard = new ChessBoard(chessBoard.FEN)
            {
                LastMove = moves[i]
            };
            possibleStates.Add(tempBoard);
        }


        var firstChessBoard = possibleStates[0];
        // Step 5: map to DTO 
        var dto = new PuzzleDTO
        {
            PuzzleId = puzzle.PuzzleId,
            ChessBoard = firstChessBoard,
            FEN = firstChessBoard.FEN,
            Rating = puzzle.Rating,
            RatingDeviation = puzzle.RatingDeviation,
            Popularity = puzzle.Popularity,
            NbPlays = puzzle.NbPlays,
            GameUrl = puzzle.GameUrl,
            OpeningTags = puzzle.OpeningTags.Split(" ").Select(x => x.Replace("_", " ")).ToList(),
            Moves = moves,
            Tags = tagNames
        };

        dto.ChessBoards = possibleStates;

        return dto;
    }
}
