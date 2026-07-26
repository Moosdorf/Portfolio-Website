using API.Controllers;
using Backend.Application.Chess;
using Backend.Application.Chess.DTO;
using Backend.Application.Chess.Services;
using Backend.Domain.Entities.Chess;
using Backend.Domain.Entities.Chess.Games;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Superpower.Model;
using System.Net.WebSockets;
using System.Security.Claims;
using System.Text.Json;

namespace Backend.API.Controllers;

[ApiController]
[Authorize]
[Route("api/chess")]
public class ChessController : HomeController
{
    private readonly IHubContext<ChessHub> _chessHub;
    private readonly IChessDataService _chessDataService;
    private readonly IStockFishService _stockFish;

    public ChessController(IHubContext<ChessHub> chessHub, IChessDataService chessDataService, IStockFishService stockFish)
    {
        _chessDataService = chessDataService;
        _stockFish = stockFish;
        _chessHub = chessHub;
    }

    [HttpGet]
    [Route("{id}")]
    public async Task<IActionResult> GetGameState(int id)
    {
        ChessGame? game = await _chessDataService.GetGameAsync(id);
        if (game == null) return NotFound("Cannot find game");

        var username = User.FindFirstValue(ClaimTypes.Name);
        var role = ResolveRole(game, username);

        return Ok(_chessDataService.CreateChessModel(new ChessBoard(game.CurrentFEN), game, role));
    }

    private string ResolveRole(ChessGame game, string? username)
    {
        if (username == null) return "spectator";
        if (game.WhiteUsername == username) return "white"; // adjust to your actual ChessGame property names
        if (game.BlackUsername == username) return "black";
        return "spectator";
    }

    // create bot game
    [HttpPost]
    [Route("bot")]
    public Task<IActionResult> CreateBotGame([FromBody] CreateChessModel model)
        => CreateGame(model, "Bot");

    // freeplay game
    [HttpPost]
    [Route("freeplay")]
    public Task<IActionResult> CreateFreeplayGame([FromBody] CreateChessModel model)
        => CreateGame(model, "Freeplay");

    // puzzle game
    [HttpPost]
    [Route("puzzle")]
    public Task<IActionResult> CreatePuzzleGame([FromBody] CreateChessModel model)
        => CreateGame(model, "Puzzle");

    private async Task<IActionResult> CreateGame(CreateChessModel model, string expectedGameMode)
    {
        Console.WriteLine("hello creating game");
        if (model == null)
        {
            Console.WriteLine("no model");
            return NotFound();
        }

        if (model.GameMode != expectedGameMode) return BadRequest("Wrong gamemode");

        var (game, chessState) = await _chessDataService.CreateGameAsync(model);

        if (game == null)
        {
            Console.WriteLine("no game");
            return NotFound();
        }

        return Ok(_chessDataService.CreateChessModel(chessState, game, "non"));
    }

    [HttpPut]
    [Route("{id}/move")]
    public async Task<IActionResult> Move(int id, [FromBody] MoveModel moveModel)
    {
        var result = await _chessDataService.MakeMoveAsync(id, moveModel);
        if (result == null) return BadRequest("Cannot make move");
        return Ok(result);
    }

    [HttpPut]
    [Route("bot/{id}/move")]
    public async Task<IActionResult> MoveBot(int id, [FromBody] MoveModel moveModel)
    {
        var result = await _chessDataService.MakePlayerMoveWithBotReplyAsync(id, moveModel);
        if (result == null) return BadRequest("Cannot make move");
        return Ok(result);
    }

    [HttpPut("{id}/forfeit")]
    public async Task<IActionResult> Forfeit(int id)
    {
        (ChessGame game, ChessBoard chessState) = await _chessDataService.Forfeit(id);

        // push to everyone in the game's SignalR group
        await _chessHub.Clients.Group($"game-{id}").SendAsync("BoardUpdated", game);

        return Ok(_chessDataService.CreateChessModel(chessState, game, "non"));
    }

    [HttpPut("{id}/draw")]
    public async Task<IActionResult> Draw(int id)
    {
        (ChessGame game, ChessBoard chessState) = await _chessDataService.Draw(id);

        // push to everyone in the game's SignalR group
        await _chessHub.Clients.Group($"game-{id}").SendAsync("BoardUpdated", game);

        return Ok(_chessDataService.CreateChessModel(chessState, game, "non"));
    }
    [HttpPut("{id}/request-draw")]
    public async Task<IActionResult> RequestDraw(int id)
    {
        var username = User.FindFirstValue(ClaimTypes.Name);

        // push to everyone in the game's SignalR group
        await _chessHub.Clients.Group($"game-{id}").SendAsync("RequestDraw", new { User = username, GameID = id});

        return Ok();
    }

    [HttpGet]
    [Route("stockfish")]
    public async Task<IActionResult> StartStocky()
    {
        _stockFish.StartNewStockFishGame();
        return Ok();
    }
}
