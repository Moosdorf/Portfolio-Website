using Backend.Application.Chess.DTO;
using Backend.Domain.Entities.Chess;
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
            .Include(p => p.PuzzleTags)
            .ThenInclude(pt => pt.Tag)
            .FirstOrDefault();

        var tagNames = puzzle.PuzzleTags.Select(pt => pt.Tag.Name).ToList();
        if (puzzle == null) return null;

        // create the puzzle (before start position)
        var chessBoard = new ChessBoard(puzzle.FEN);

        // make move creating the initial position
        var moves = puzzle.Moves.Split(" ").Select(x => x.Insert(2, ",")).ToList();
        chessBoard.Move(new MoveModel { Move = moves[0] });

        moves.Remove(moves[0]);

        // Step 5: map to DTO 
        var dto = new PuzzleDTO
        {
            PuzzleId = puzzle.PuzzleId,
            ChessBoard = chessBoard,
            FEN = chessBoard.FEN,
            Rating = puzzle.Rating,
            RatingDeviation = puzzle.RatingDeviation,
            Popularity = puzzle.Popularity,
            NbPlays = puzzle.NbPlays,
            GameUrl = puzzle.GameUrl,
            OpeningTags = puzzle.OpeningTags.Split(" ").Select(x => x.Replace("_", " ")).ToList(),
            Moves = moves,
            Tags = tagNames
        };



        return dto;
    }

    public PuzzleDTO MovePuzzle(PuzzleMove puzzleMove)
    {
        Console.WriteLine("find puzzle");
        var puzzle = _db.Puzzles
            .Where(p => p.PuzzleId == puzzleMove.PuzzleId)
            .Include(p => p.PuzzleTags)
            .ThenInclude(pt => pt.Tag)
            .FirstOrDefault();
        var tagNames = puzzle.PuzzleTags.Select(pt => pt.Tag.Name).ToList();

        Console.WriteLine("create chess state");
        var chessState = new ChessBoard(puzzleMove.FEN);
        Console.WriteLine("make user move");
        chessState.Move(new MoveModel
        {
            Move = puzzleMove.Move
        });

        var moves = puzzle.Moves.Split(" ").Select(x => x.Insert(2, ",")).ToList();
        var moveAnswer = "";

        for (int i = 0; i < moves.Count(); i++)
        {
            if (puzzleMove.Move == moves[i])
            {
                try {
                    moveAnswer = moves[i + 1];
                } catch(IndexOutOfRangeException e)
                {
                    return new PuzzleDTO
                    {
                        PuzzleId = puzzle.PuzzleId,
                        ChessBoard = chessState,
                        FEN = chessState.FEN,
                        Rating = puzzle.Rating,
                        RatingDeviation = puzzle.RatingDeviation,
                        Popularity = puzzle.Popularity,
                        NbPlays = puzzle.NbPlays,
                        GameUrl = puzzle.GameUrl,
                        OpeningTags = puzzle.OpeningTags.Split(" ").Select(x => x.Replace("_", " ")).ToList(),
                        Moves = moves,
                        Tags = tagNames
                    };
                }
                break;
            }
        }

        Console.WriteLine("make puzzle move: " + moveAnswer);
        chessState.Move(new MoveModel
        {
            Move = moveAnswer
        });

        Console.WriteLine("create dto");
        var dto = new PuzzleDTO
        {
            PuzzleId = puzzle.PuzzleId,
            ChessBoard = chessState,
            FEN = chessState.FEN,
            Rating = puzzle.Rating,
            RatingDeviation = puzzle.RatingDeviation,
            Popularity = puzzle.Popularity,
            NbPlays = puzzle.NbPlays,
            GameUrl = puzzle.GameUrl,
            OpeningTags = puzzle.OpeningTags.Split(" ").Select(x => x.Replace("_", " ")).ToList(),
            Moves = moves,
            Tags = tagNames
        };



        return dto;
    }
}
