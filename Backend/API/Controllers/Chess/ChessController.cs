using API.Controllers;
using Backend.Application.Chess;
using Backend.Application.Chess.DTO;
using Backend.Application.Chess.Services;
using Backend.Domain.Entities.Chess;
using Backend.Domain.Entities.Chess.Games;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
    IStockFishService stockFish;
    readonly LinkGenerator _linkGenerator;

    public ChessController(IChessDataService chessDataService, IStockFishService stockFishService, LinkGenerator linkGenerator)
    {
        this.chessDataService = chessDataService;
        _linkGenerator = linkGenerator;
        stockFish = stockFishService;
    }
    // get game
    [HttpGet]
    [Route("{id}")]
    public async Task<IActionResult> GetGameState(int id)
    {
        ChessGame? game = await chessDataService.GetGameAsync(id);
        if (game == null) return BadRequest("Cannot find game");
        Console.WriteLine("hello");
        Console.WriteLine(game.CurrentFEN); 
        return Ok(JsonSerializer.Serialize(chessDataService.CreateChessModel(new ChessBoard(game.CurrentFEN), game, "non")));
    }

    // create game
    [HttpPost]
    [Route("new")]
    public async Task<IActionResult> CreateGame([FromBody] CreateChessModel model)
    {
        Console.WriteLine(model);
        if (model == null)
        {
            Console.WriteLine("no model");
            return NotFound();
        }

        (ChessGame game, ChessBoard chessState) = await chessDataService.CreateGameAsync(model);


        if (game == null)
        {
            Console.WriteLine("no game");
            return NotFound();
        }


        Console.WriteLine("ok");
        return Ok(JsonSerializer.Serialize(chessDataService.CreateChessModel(chessState, game, "non")));
    }

    // create bot game
    [HttpPost]
    [Route("newbotgame")]
    public async Task<IActionResult> CreateBotGame(CreateBotChessModel model)
    {
        if (model == null)
        {
            Console.WriteLine("model null");
            return NotFound();
        }

        var username = User.FindFirstValue(ClaimTypes.Name);

        (ChessGame game, ChessBoard chessState) = await chessDataService.CreateBotGameAsync(username, model.PickedWhite);


        if (game == null)
        {
            Console.WriteLine("game null");
            return NotFound();
        }


        return Ok(JsonSerializer.Serialize(chessDataService.CreateChessModel(chessState, game, "non")));
    }

    [HttpPut]
    [Route("{id}/move")]
    public async Task<IActionResult> Move(int id, [FromBody] MoveModel moveModel)
    {
        Console.WriteLine("go move");
        ChessGame? game = await chessDataService.GetGameAsync(id);
        // check if user is part of the game here if (game.player1 || game.player2 == moveModel.id???) return BadRequest("user not part of game");
        if (game == null) return BadRequest("CannotFindGame");

        Console.WriteLine("found game");
        ChessBoard chessState;
        // create chess state from moves
        if (game.Moves.Count > 0)
        {
            chessState = new ChessBoard(game.Moves.Last().FEN); // find last moves FEN to create state from
        }
        else
            chessState = new ChessBoard();

        Console.WriteLine("generated chessboard");

        // validate if the move can be made
        var canMove = chessState.Move(moveModel);
        if (!canMove) return BadRequest("Cannot make move - dataservice");

        Console.WriteLine("move is possible");
        var FEN = ChessMethods.GenerateFEN(chessState);

        // change in the database
        var moveMade = await chessDataService.MoveAsync(id, moveModel.Move, FEN);
        if (!moveMade) return BadRequest("Cannot make move - database");

        Console.WriteLine("sending back new chessState");
        return Ok(JsonSerializer.Serialize(chessDataService.CreateChessModel(chessState, game, "non")));
    }


    [HttpPut]
    [Route("{id}/moveBot")]
    public async Task<IActionResult> MoveBot(int id)
    {
        ChessGame? game = await chessDataService.GetGameAsync(id);
        // check if user is part of the game here if (game.player1 || game.player2 == moveModel.id???) return BadRequest("user not part of game");
        if (game == null) return BadRequest("CannotFindGame");

        ChessBoard chessState;
        // create chess state from moves
        if (game.Moves.Count > 0)
        {
            Console.WriteLine("atleast 1 move");
            chessState = new ChessBoard(game.Moves.Last().FEN); // find last moves FEN to create state from
        }
        else
        {
            Console.WriteLine("no moves made");
            chessState = new ChessBoard();
        }


        var lastFEN = ChessMethods.GenerateFEN(chessState);


        Console.WriteLine(lastFEN);
        var stockFishMove = stockFish.MoveFrom(lastFEN);

        // validate if the move can be made
        var canMove = chessState.Move(stockFishMove);
        if (!canMove) return BadRequest("Cannot make move - dataservice");

        var FEN = ChessMethods.GenerateFEN(chessState);
        Console.WriteLine("new fen: " + FEN);

        // change in the database
        var moveMade = await chessDataService.MoveAsync(id, stockFishMove.Move, FEN);
        if (!moveMade) return BadRequest("Cannot make move - database");
        return Ok(JsonSerializer.Serialize(chessDataService.CreateChessModel(chessState, game, "non")));
    }


    [HttpGet]
    [Route("stockfish")]
    public async Task<IActionResult> StartStocky()
    {
        stockFish.StartNewStockFishGame();
        return Ok();
    }
}
