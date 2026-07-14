using Backend.Application.Chess.DTO;
using Backend.Application.General.Services;
using Backend.Application.Users.Services;
using Backend.Domain.Entities.Chess.Games;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Application.Chess.Services;

public class ChessDataService : IChessDataService
{
    private AppDbContext _db;
    private IUserService _dataService;

    public ChessDataService(AppDbContext context, IUserService dataService)
    {
        _db = context;
        _dataService = dataService;
    }



    public async Task<(ChessGame, ChessBoard)> CreateGameAsync(CreateChessModel createChessModel)
    {
        var white = await _dataService.GetById(createChessModel.WhiteId);
        var black = await _dataService.GetById(createChessModel.BlackId);

       if (white == null && black == null)
       {
            Console.WriteLine("players null");
            return (null, null);
       }


        var dbEntryChessGame = new ChessGame()
        {
            WhiteUsername = white.Username,
            BlackUsername = black.Username,
            WhitePlayer = white,
            BlackPlayer = black,
            GameType = createChessModel.GameMode,
        };
        var chessBoard = new ChessBoard();



        _db.ChessGames.Add(dbEntryChessGame);
        await _db.SaveChangesAsync();
        return (dbEntryChessGame, chessBoard);
    }

    public async Task<(ChessGame, ChessBoard)> CreateBotGameAsync(CreateChessModel createChessModel)
    {
        bool white = createChessModel.BlackId == -1;
        var playerId = white ? createChessModel.WhiteId : createChessModel.BlackId;

        var player1 = await _dataService.GetById(playerId);
        var botPlayer = await _dataService.GetByUsername("Stockfish - Bot");

        var chessBoard = new ChessBoard();
        var dbEntryChessGame = new ChessGame()
        {
            WhiteId = (white) ? player1.Id : botPlayer.Id,
            WhitePlayer = (white) ? player1 : botPlayer,
            BlackId = (!white) ? player1.Id : botPlayer.Id,
            BlackPlayer = (!white) ? player1 : botPlayer,
            WhiteUsername = (white) ? player1.Username : botPlayer.Username,
            BlackUsername = (!white) ? player1.Username : botPlayer.Username,
            GameType = "Bot"
        };

        _db.ChessGames.Add(dbEntryChessGame);
        await _db.SaveChangesAsync();
        return (dbEntryChessGame, chessBoard);
    }

    public async Task<bool> MoveAsync(int chessId, string move, string FEN)
    {
        var newMove = new Move()
        {
            ChessGameId = chessId,
            MoveString = move,
            FEN = FEN
        };

        _db.Moves.Add(newMove);
        var result = await _db.SaveChangesAsync() > 0;
        return result;
    }

    public async Task<ChessGame?> EndGame(int chessId, GameResult result)
    {
        ChessGame game = _db.ChessGames.FirstOrDefault(x => x.Id == chessId);
        if (game == null) return null;
        Console.WriteLine("chess id: " + chessId);
        game.Result = result;
        Console.WriteLine("game results: " + result);
        var saved = await _db.SaveChangesAsync() > 0;
        Console.WriteLine("saved");

        if (saved) return game;
        return null;
    } 

    public ChessModel CreateChessModel(ChessBoard chessState, ChessGame game, string sessionId) 
    {
        var isWhite = chessState.Turn == "w";
        var king = (isWhite) ? chessState.WhiteKing : chessState.BlackKing;
        var inCheck = chessState.InCheck;
        var blockers = chessState.Blockers;

        bool gameDone = false;

        var pieces = (isWhite) ? chessState.WhitePieces : chessState.BlackPieces;

        bool availableMoves = pieces.Any(x => x.AvailableMoves.Count > 0 || x.AvailableCaptures.Count > 0);


        if (!availableMoves)
        {
            gameDone = true;
            Console.WriteLine("draw");
            // draw
        }

        if (!availableMoves && inCheck)
        {
            Console.WriteLine("a player has won");
            gameDone = true;
            // a player has won
        }

        if (game.Result != GameResult.Ongoing)
        {
            Console.WriteLine("game is already done");
            gameDone = true;
        }

        var currentPlayer = (isWhite) ? game.WhitePlayer.Username : game.BlackPlayer.Username;

        List<string> fenList = new List<string>();
        fenList.Add("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
        foreach (var move in game.Moves)
        {
            fenList.Add(move.FEN);
        }

        return new ChessModel
            { SessionId = sessionId, 
            Players = [game.WhitePlayer.Username, game.BlackPlayer.Username], 
            ChessBoard = chessState, 
            Id = game.Id,
            FenList = fenList.ToArray(),
            GameType = game.GameType
        };
    }

   

    const int pageSize = 5;
    public async Task<PaginatedList<ChessGameHistoryDTO>> GetMatchHistory(string username, int pageIndex)
    {
        var query = _db.ChessGames
            .AsNoTracking() // just reading
            .Where(g => g.WhitePlayer.Username == username || g.BlackPlayer.Username == username);

        var totalCount = await query.CountAsync();
        Console.WriteLine("here");
        Console.WriteLine(pageIndex);
        Console.WriteLine(pageSize);
        var games = query
            .OrderByDescending(g => g.Id)
            .Skip(pageIndex * pageSize)
            .Take(pageSize)
            .Select(g => new ChessGameHistoryDTO
            {
                Id = g.Id,
                WhitePlayer = g.WhitePlayer.Username ?? "Unknown",
                BlackPlayer = g.BlackPlayer.Username ?? "Unknown",
                Moves = g.Moves,
                Winner = (g.Result == GameResult.WhiteWin) ? g.WhitePlayer.Username : (g.Result == GameResult.BlackWin) ? g.BlackPlayer.Username : (g.Result == GameResult.Draw) ? "draw" : "ongoing",
                FEN = g.Moves
                    .OrderByDescending(m => m.Id)
                    .Select(m => m.FEN)
                    .FirstOrDefault() ?? "",
            }).AsNoTracking();

        return await PaginatedList<ChessGameHistoryDTO>.CreateAsync(games, totalCount, pageIndex, pageSize);
    }
    public async Task<ChessGame?> GetGameAsync(int chessId)
    {
        var game = await _db.ChessGames
                        .Include(g => g.Moves)
                        .Include(g => g.BlackPlayer)
                        .Include(g => g.WhitePlayer)
                        .FirstOrDefaultAsync(g => g.Id == chessId);
        return game;
    }

    public IList<ChessGame> GetGames()
    {
        throw new NotImplementedException();
    }


    public bool RemoveLastMove(int chessId)
    {
        throw new NotImplementedException();
    }
}

