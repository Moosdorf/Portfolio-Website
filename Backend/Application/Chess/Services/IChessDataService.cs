
using Backend.Application.Chess.DTO;
using Backend.Application.General.Services;
using Backend.Domain.Entities.Chess.Games;

namespace Backend.Application.Chess.Services;

public interface IChessDataService
{
    Task<(ChessGame, ChessBoard)> CreateGameAsync(CreateChessModel createChessModel);
    Task<(ChessGame, ChessBoard)> CreateBotGameAsync(CreateChessModel createChessModel);
    Task<ChessGame?> EndGame(int chessId, GameResult result);

    Task<PaginatedList<ChessGameHistoryDTO>> GetMatchHistory(string username, int pageIndex);
    Task<bool> MoveAsync(int chessId, string move, string FEN);

    public ChessModel CreateChessModel(ChessBoard chessState, ChessGame game, string sessionId);

    bool RemoveLastMove(int chessId);



    IList<ChessGame> GetGames();

    Task<ChessGame?> GetGameAsync(int chessId);
}
