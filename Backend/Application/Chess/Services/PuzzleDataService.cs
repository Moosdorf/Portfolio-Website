using Backend.Application.Chess.DTO;
using Backend.Domain.Entities.Chess.Games;
using Backend.Domain.Entities.Users;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics.Eventing.Reader;
using System.Security.Claims;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;


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

    public PuzzleDTO? GetRankedPuzzle(int rating)
    {
        int minRating = rating - 50;
        int maxRating = rating + 50;

        var query = _db.Puzzles
            .Where(p => p.Rating >= minRating && p.Rating <= maxRating);

        var count = query.Count();
        if (count == 0) return null; // no puzzles in range

        var randomOffset = _random.Next(0, count);

        var puzzle = query
            .OrderBy(p => p.Id) 
            .Skip(randomOffset)
            .Take(1)
            .Include(p => p.PuzzleTags)
                .ThenInclude(pt => pt.Tag)
            .FirstOrDefault();

        return puzzle == null ? null : CreatePuzzleDTO(puzzle);
    }

    public int AdjustPuzzleRating(string username, bool successful)
    {
        var user = _db.Users.FirstOrDefault(u => u.Username == username);

        if (user == null) return 0;

        if (successful) {
            user.PuzzleRating += 10;
        }
        else
        {
            user.PuzzleRating -= 10;
        }

        return (_db.SaveChanges() > 0) ? user.PuzzleRating : 0;
    }

    public bool IsPuzzleSolved(string puzzleId, string[] moves)
    {
        // get puzzle
        var query = _db.Puzzles
                .Where(p => p.PuzzleId == puzzleId);
        var puzzle = query.FirstOrDefault();
        Console.WriteLine(4.1);


        // check if puzzle and moves exists
        Console.WriteLine(puzzle == null);

        Console.WriteLine(moves.Length == 0 );

        if (puzzle == null || moves.Length == 0) return false;
        Console.WriteLine(4.2);
        var movesToCheck = puzzle.Moves.Split(" ")
                .Select(x => x.Insert(2, ","))
                .Where((x, i) => i % 2 != 0)
                .ToArray();
        Console.WriteLine("player moves");
        foreach (var x in moves)
        {
            Console.WriteLine(x);
        }

        Console.WriteLine("Best moves");
        foreach (var x in movesToCheck)
        {
            Console.WriteLine(x);
        }

        return moves.SequenceEqual(movesToCheck);
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
