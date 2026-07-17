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
    IChessDataService chessDataService;
    private readonly IServiceScopeFactory _scopeFactory;
    IStockFishService stockFish;
    IHubContext<ChessHub> chessHub;
    readonly LinkGenerator linkGenerator;

    public ChessController(IServiceScopeFactory scopeFactory, IChessDataService chessDataService, IStockFishService stockFish, IHubContext<ChessHub> chessHub, LinkGenerator linkGenerator)
    {
        this.chessDataService = chessDataService;
        this.chessHub = chessHub;
        this.linkGenerator = linkGenerator;
        this.stockFish = stockFish;
        _scopeFactory = scopeFactory;
    }

    // get game
    [HttpGet]
    [Route("{id}")]
    public async Task<IActionResult> GetGameState(int id)
    {
        ChessGame? game = await chessDataService.GetGameAsync(id);
        if (game == null) return NotFound("Cannot find game");
        return Ok(chessDataService.CreateChessModel(new ChessBoard(game.CurrentFEN), game, "non"));
    }

    // create bot game
    [HttpPost]
    [Route("new")]
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
        if (model == null)
        {
            Console.WriteLine("no model");
            return NotFound();
        }
        if (model.GameMode != expectedGameMode) return BadRequest("Wrong gamemode");

        var (game, chessState) = await chessDataService.CreateGameAsync(model);

        if (game == null)
        {
            Console.WriteLine("no game");
            return NotFound();
        }

        return Ok(chessDataService.CreateChessModel(chessState, game, "non"));
    }

    [HttpPut]
    [Route("{id}/move")]
    public async Task<IActionResult> Move(int id, [FromBody] MoveModel moveModel)
    {
        ChessGame? game = await chessDataService.GetGameAsync(id);
        if (game == null) return NotFound("CannotFindGame");

        ChessBoard chessState;
        if (game.Moves.Count > 0)
        {
            chessState = new ChessBoard(game.Moves.Last().FEN);
        }
        else
            chessState = new ChessBoard();

        var canMove = chessState.Move(moveModel);
        if (!canMove) return BadRequest("Cannot make move - dataservice");

        var FEN = ChessMethods.GenerateFEN(chessState);

        var moveMade = await chessDataService.MoveAsync(id, moveModel.Move, FEN);
        if (!moveMade) return BadRequest("Cannot make move - database");

        return Ok(chessDataService.CreateChessModel(chessState, game, "non"));
    }

    [HttpPut]
    [Route("bot/{id}/move")]
    public async Task<IActionResult> MoveBot(int id, [FromBody] MoveModel moveModel)
    {
        ChessGame? game = await chessDataService.GetGameAsync(id);
        if (game == null) return NotFound("CannotFindGame");

        ChessBoard chessState;
        if (game.Moves.Count > 0)
        {
            chessState = new ChessBoard(game.Moves.Last().FEN);
        }
        else
            chessState = new ChessBoard();

        var canMove = chessState.Move(moveModel);
        if (!canMove) return BadRequest("Cannot make move - dataservice");

        var moveMade = await chessDataService.MoveAsync(id, moveModel.Move, chessState.FEN);
        if (!moveMade) return BadRequest("Cannot make move - database");

        var result = chessDataService.CreateChessModel(chessState, game, "non");

        if (game.GameType == "Bot")
        {
            _ = Task.Run(async () =>
            {
                using var scope = _scopeFactory.CreateScope();
                var scopedChessDataService = scope.ServiceProvider.GetRequiredService<IChessDataService>();
                var scopedStockFish = scope.ServiceProvider.GetRequiredService<IStockFishService>();

                try
                {
                    var freshGame = await scopedChessDataService.GetGameAsync(id);
                    if (freshGame == null) { Console.WriteLine("Game vanished"); return; }

                    var stockFishMove = scopedStockFish.MoveFrom(chessState.FEN);

                    var canMove = chessState.Move(stockFishMove);
                    if (!canMove) Console.WriteLine("Cannot make move - dataservice");

                    var moveMade = await scopedChessDataService.MoveAsync(id, stockFishMove.Move, chessState.FEN);
                    if (!moveMade) Console.WriteLine("Cannot make move - database");

                    var botResult = scopedChessDataService.CreateChessModel(chessState, freshGame, "non");

                    await chessHub.Clients.Group($"game-{game.Id}")
                        .SendAsync("BoardUpdated", botResult);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Bot move failed: {ex}");
                }
            });
        }

        return Ok(result);
    }

    [HttpGet]
    [Route("stockfish")]
    public async Task<IActionResult> StartStocky()
    {
        stockFish.StartNewStockFishGame();
        return Ok();
    }
}
