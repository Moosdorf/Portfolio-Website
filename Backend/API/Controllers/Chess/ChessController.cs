using API.Controllers;
using Backend.Application.Auth.Services;
using Backend.Application.Chess.DTO;
using Backend.Application.Chess.Services;
using Backend.Application.General.Services;
using Backend.Application.Users.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Backend.API.Controllers.Chess;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ChessController(AuthService authService, UserService userService, ChessService chessService) : HomeController()
{
    private readonly AuthService authService = authService;
    private readonly UserService userService = userService;
    private readonly ChessService chessService = chessService;

    [HttpPost]
    [Route("create")]
    public async Task<IActionResult> CreateGame([FromBody] StartChessGameRequest startChessGameRequest)
    {
        var username = User.FindFirstValue(ClaimTypes.Name);

        var chessGameResponse = await chessService.CreateGame(startChessGameRequest, username);

        if (!chessGameResponse.Successful)
        {
            return BadRequest(chessGameResponse);
        }

        return Created($"/{chessGameResponse.GameId}", chessGameResponse);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetGame(int id)
    {
        var game = await chessService.GetGameById(id);
        if (game == null) BadRequest("Game was not found");
        return Ok(game);
    }

    [HttpGet("{id}/board")]
    public async Task<IActionResult> GetGameBoard(int id)
    {
        var game = await chessService.GetGameBoardById(id);
        if (game == null) BadRequest("Game was not found");
        return Ok(game);
    }
}