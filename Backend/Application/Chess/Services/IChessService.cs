using Backend.Application.Chess.DTO;
using Backend.Application.Chess.Responses;
using Backend.Domain.Entities.Chess.Games;

namespace Backend.Application.Chess.Services
{
    public interface IChessService
    {
        public Task<ChessGameDto> GetGameById(int chessId);
        public Task<ChessGame> GetGameBoardById(int chessId);
        public Task<StartGameResponse> CreateGame(StartChessGameRequest startChessGameRequest, string username);
    }
}
