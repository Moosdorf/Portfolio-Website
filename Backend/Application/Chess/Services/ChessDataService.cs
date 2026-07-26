using Backend.Application.Chess.DTO;
using Backend.Application.General.Services;
using Backend.Application.Users.Services;
using Backend.Domain.Entities.Chess.Games;
using Infrastructure.Data;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Backend.Application.Chess.Services;

public class ChessDataService : IChessDataService
{
    private const string BotUsername = "Stockfish - Bot";

    private AppDbContext _db;
    private IUserService _dataService;
    private readonly IHubContext<ChessHub> _chessHub;
    private readonly IServiceScopeFactory _scopeFactory;

    public ChessDataService(AppDbContext context, IUserService dataService, IHubContext<ChessHub> chessHub, IServiceScopeFactory scopeFactory)
    {
        _db = context;
        _dataService = dataService;
        _chessHub = chessHub;
        _scopeFactory = scopeFactory;
    }

    // shared board-state loader — was duplicated in the Move and MoveBot controller actions
    private static ChessBoard LoadBoardState(ChessGame game)
    {
        return game.Moves.Count > 0
            ? new ChessBoard(game.Moves.Last().FEN)
            : new ChessBoard();
    }

    // replaces the body of ChessController.Move
    public async Task<ChessModel?> MakeMoveAsync(int chessId, MoveModel moveModel)
    {
        var game = await GetGameAsync(chessId);
        if (game == null) return null;

        var chessState = LoadBoardState(game);
        if (!chessState.Move(moveModel)) return null;

        var moveMade = await MoveAsync(chessId, moveModel.Move, chessState.FEN);
        if (!moveMade) return null;

        return CreateChessModel(chessState, game, "non");
    }

    // replaces the body of ChessController.MoveBot
    public async Task<ChessModel?> MakePlayerMoveWithBotReplyAsync(int chessId, MoveModel moveModel)
    {
        var game = await GetGameAsync(chessId);
        if (game == null) return null;

        var chessState = LoadBoardState(game);
        if (!chessState.Move(moveModel)) return null;

        var moveMade = await MoveAsync(chessId, moveModel.Move, chessState.FEN);
        if (!moveMade) return null;

        var result = CreateChessModel(chessState, game, "non");

        if (game.GameType == "Bot")
        {
            QueueBotReply(chessId, game.Id, chessState.FEN);
        }

        return result;
    }

    // fire-and-forget bot reply — runs in its own scope since the request's
    // scoped services (db context etc.) are disposed once the response is sent
    private void QueueBotReply(int chessId, int gameId, string fenAfterPlayerMove)
    {
        _ = Task.Run(async () =>
        {
            using var scope = _scopeFactory.CreateScope();
            var scopedChessDataService = scope.ServiceProvider.GetRequiredService<IChessDataService>();
            var scopedStockFish = scope.ServiceProvider.GetRequiredService<IStockFishService>();

            try
            {
                var freshGame = await scopedChessDataService.GetGameAsync(chessId);
                if (freshGame == null) { Console.WriteLine("Game vanished"); return; }

                // fresh board, independent from the one already returned to the player's HTTP response
                var botChessState = new ChessBoard(fenAfterPlayerMove);
                var stockFishMove = scopedStockFish.MoveFrom(fenAfterPlayerMove);

                if (!botChessState.Move(stockFishMove))
                {
                    Console.WriteLine("Cannot make move - dataservice");
                    return;
                }

                var moveMade = await scopedChessDataService.MoveAsync(chessId, stockFishMove.Move, botChessState.FEN);
                if (!moveMade)
                {
                    Console.WriteLine("Cannot make move - database");
                    return;
                }

                var botResult = scopedChessDataService.CreateChessModel(botChessState, freshGame, "non");

                await _chessHub.Clients.Group($"game-{gameId}").SendAsync("BoardUpdated", botResult);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Bot move failed: {ex}");
            }
        });
    }

    public async Task<(ChessGame, ChessBoard)> CreateGameAsync(CreateChessModel createChessModel)
    {
        var (whiteId, blackId) = createChessModel.GameMode == "Bot"
            ? await ResolveBotPlayerIdsAsync(createChessModel)
            : (createChessModel.WhiteId, createChessModel.BlackId);

        var white = await _dataService.GetById(whiteId);
        var black = await _dataService.GetById(blackId);

        if (white == null || black == null)
        {
            Console.WriteLine("players null");
            return (null, null);
        }

        var dbEntryChessGame = new ChessGame()
        {
            WhiteId = white.Id,
            BlackId = black.Id,
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

    // Bot games encode "who's the human" via BlackId == -1.
    // Resolves that into a concrete (whiteId, blackId) pair against the bot user.
    private async Task<(int whiteId, int blackId)> ResolveBotPlayerIdsAsync(CreateChessModel model)
    {
        bool humanIsWhite = model.BlackId == -1;
        var humanId = humanIsWhite ? model.WhiteId : model.BlackId;
        var bot = await _dataService.GetByUsername(BotUsername);

        return humanIsWhite ? (humanId, bot.Id) : (bot.Id, humanId);
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
        game.Result = result;
        var saved = await _db.SaveChangesAsync() > 0;

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
            // draw
        }

        if (!availableMoves && inCheck)
        {
            gameDone = true;
            // a player has won
        }

        if (game.Result != GameResult.Ongoing)
        {
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
        {
            SessionId = sessionId,
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
            .AsNoTracking()
            .Where(g => g.WhitePlayer.Username == username || g.BlackPlayer.Username == username);

        var totalCount = await query.CountAsync();
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

    public async Task<(ChessGame game, ChessBoard chessState)?> Draw(int id)
    {
        var game = await _db.ChessGames
                .Include(g => g.Moves)
                .Include(g => g.BlackPlayer)
                .Include(g => g.WhitePlayer)
                .FirstOrDefaultAsync(g => g.Id == id);

        if (game == null) return null;

        game.Result = GameResult.Draw;
        var saved = _db.SaveChanges() > 0;


        if (saved) return (game, new ChessBoard(game.CurrentFEN));

        return null;
    }

    public Task<(ChessGame game, ChessBoard chessState)> Forfeit(int id)
    {
        throw new NotImplementedException();
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
