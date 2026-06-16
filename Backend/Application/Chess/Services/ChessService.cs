using AutoMapper;
using Backend.Application.Chess.DTO;
using Backend.Application.Chess.Responses;
using Backend.Application.Users.Services;
using Backend.Domain.Entities.Chess.Games;
using Backend.Domain.Entities.Users;
using Infrastructure.Data;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace Backend.Application.Chess.Services;


// Create a profile
public class ChessProfile : Profile
{
    public ChessProfile()
    {
        CreateMap<ChessGame, ChessGameDto>();
    }
}

public class ChessService : IChessService
{
    private readonly AppDbContext _context;
    private readonly IUserService _userService;
    private readonly IMapper _mapper;
    public ChessService(AppDbContext context, UserService userService, IMapper mapper)
    {
        _context = context;
        _userService = userService;
        _mapper = mapper;
    }

    public async Task<ChessGameDto> GetGameById(int chessId) 
    {
        ChessGame game = _context.ChessGames
            .Include(g => g.White)
            .Include(g => g.Black)
            .FirstOrDefault(g => g.Id == chessId);

        return _mapper.Map<ChessGameDto>(game);
    }

    public async Task<ChessGame> GetGameBoardById(int chessId)
    {
        ChessGame game = _context.ChessGames
            .Include(g => g.White)
            .Include(g => g.Black)
            .FirstOrDefault(g => g.Id == chessId);

        return game;
    }

    public async Task<StartGameResponse> CreateGame(StartChessGameRequest startChessGameRequest, string username)
    {
        var created = 0;
        User white = _userService.GetById(startChessGameRequest.WhiteId);
        User black = _userService.GetById(startChessGameRequest.BlackId);

        if (black.Username != username && white.Username != username)
            return new StartGameResponse
            {
                Successful = false
            };

        var newGame = new ChessGame
        {
            White = white,
            WhiteId = white.Id,
            Black = black,
            BlackId = black.Id
        };
        try
        {
            _context.ChessGames.Add(newGame);
            created = _context.SaveChanges();
        }
        catch (Exception ex)
        {
            return new StartGameResponse
            {
                Successful = false
            };
        }

        return new StartGameResponse
        {
            GameId = newGame.Id,
            Successful = created > 0
        };
    }


}
