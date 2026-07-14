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
        if (game == null) return BadRequest("Cannot find game");
        return Ok(JsonSerializer.Serialize(chessDataService.CreateChessModel(new ChessBoard(game.CurrentFEN), game, "non")));
    }

    // create bot game
    [HttpPost]
    [Route("new")]
    public async Task<IActionResult> CreateBotGame([FromBody] CreateChessModel model)
    {
        
        if (model == null)
        {
            Console.WriteLine("no model");
            return NotFound();
        }
        if (model.GameMode != "Bot") return BadRequest("Wrong gamemode"); 
        ChessGame game;
        ChessBoard chessState;

        (game, chessState) = await chessDataService.CreateBotGameAsync(model);

        if (game == null)
        {
            Console.WriteLine("no game");
            return NotFound();
        }


        return Ok(JsonSerializer.Serialize(chessDataService.CreateChessModel(chessState, game, "non")));
    }

    // freeplay game
    [HttpPost]
    [Route("freeplay")]
    public async Task<IActionResult> CreateFreeplayGame([FromBody] CreateChessModel model)
    {
        Console.WriteLine(model);
        if (model == null)
        {
            Console.WriteLine("no model");
            return NotFound();
        }
        if (model.GameMode != "Freeplay") return BadRequest("Wrong gamemode");

        ChessGame game;
        ChessBoard chessState;
        (game, chessState) = await chessDataService.CreateGameAsync(model);

        if (game == null)
        {
            Console.WriteLine("no game");
            return NotFound();
        }


        return Ok(JsonSerializer.Serialize(chessDataService.CreateChessModel(chessState, game, "non")));
    }

    // puzzle game
    [HttpPost]
    [Route("puzzle")]
    public async Task<IActionResult> CreatePuzzleGame([FromBody] CreateChessModel model)
    {
        Console.WriteLine(model);
        if (model == null)
        {
            Console.WriteLine("no model");
            return NotFound();
        }
        if (model.GameMode != "Puzzle") return BadRequest("Wrong gamemode");

        ChessGame game;
        ChessBoard chessState;
        (game, chessState) = await chessDataService.CreateGameAsync(model);

        if (game == null)
        {
            Console.WriteLine("no game");
            return NotFound();
        }


        return Ok(JsonSerializer.Serialize(chessDataService.CreateChessModel(chessState, game, "non")));
    }



    [HttpPut]
    [Route("{id}/move")]
    public async Task<IActionResult> Move(int id, [FromBody] MoveModel moveModel)
    {
        ChessGame? game = await chessDataService.GetGameAsync(id);
        // check if user is part of the game here if (game.player1 || game.player2 == moveModel.id???) return BadRequest("user not part of game");
        if (game == null) return BadRequest("CannotFindGame");

        ChessBoard chessState;
        // create chess state from moves
        if (game.Moves.Count > 0)
        {
            chessState = new ChessBoard(game.Moves.Last().FEN); // find last moves FEN to create state from
        }
        else
            chessState = new ChessBoard();


        // validate if the move can be made
        var canMove = chessState.Move(moveModel);
        if (!canMove) return BadRequest("Cannot make move - dataservice");

        var FEN = ChessMethods.GenerateFEN(chessState);

        // change in the database
        var moveMade = await chessDataService.MoveAsync(id, moveModel.Move, FEN);
        if (!moveMade) return BadRequest("Cannot make move - database");

        return Ok(JsonSerializer.Serialize(chessDataService.CreateChessModel(chessState, game, "non")));
    }


    [HttpPut]
    [Route("bot/{id}/move")]
    public async Task<IActionResult> MoveBot(int id, [FromBody] MoveModel moveModel)
    {
        ChessGame? game = await chessDataService.GetGameAsync(id);
        // check if user is part of the game here if (game.player1 || game.player2 == moveModel.id???) return BadRequest("user not part of game");
        if (game == null) return BadRequest("CannotFindGame");

        ChessBoard chessState;
        // create chess state from moves
        if (game.Moves.Count > 0)
        {
            chessState = new ChessBoard(game.Moves.Last().FEN); // find last moves FEN to create state from
        }
        else
            chessState = new ChessBoard();


        // validate if the move can be made
        var canMove = chessState.Move(moveModel);
        if (!canMove) return BadRequest("Cannot make move - dataservice");

        // change in the database
        var moveMade = await chessDataService.MoveAsync(id, moveModel.Move, chessState.FEN);
        if (!moveMade) return BadRequest("Cannot make move - database");

        var result = JsonSerializer.Serialize(chessDataService.CreateChessModel(chessState, game, "non"));


        if (game.GameType == "Bot")
        {
            _ = Task.Run(async () =>
            {
                using var scope = _scopeFactory.CreateScope();
                var scopedChessDataService = scope.ServiceProvider.GetRequiredService<IChessDataService>();
                var scopedStockFish = scope.ServiceProvider.GetRequiredService<IStockFishService>();

                try
                {

                    Console.WriteLine("1");
                    var freshGame = await scopedChessDataService.GetGameAsync(id);
                    if (freshGame == null) { Console.WriteLine("Game vanished"); return; }

                    Console.WriteLine("2");
                    var stockFishMove = scopedStockFish.MoveFrom(chessState.FEN);

                    Console.WriteLine("3");
                    var canMove = chessState.Move(stockFishMove);
                    if (!canMove) Console.WriteLine("Cannot make move - dataservice");

                    Console.WriteLine("4");
                    var moveMade = await scopedChessDataService.MoveAsync(id, stockFishMove.Move, chessState.FEN);
                    if (!moveMade) Console.WriteLine("Cannot make move - database");

                    Console.WriteLine("6");
                    var botResult = scopedChessDataService.CreateChessModel(chessState, freshGame, "non");

                    Console.WriteLine("7");
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
