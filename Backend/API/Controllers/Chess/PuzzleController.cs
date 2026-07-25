using API.Controllers;
using Backend.Application.Chess;
using Backend.Application.Chess.DTO;
using Backend.Application.Chess.Services;
using Backend.Application.Users.Services;
using Backend.Domain.Entities.Chess;
using Backend.Domain.Entities.Chess.Games;
using Backend.Domain.Entities.Users;
using DataLayer.csv_scripts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;

namespace ChessServer.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/puzzle")]
    public class PuzzleController : HomeController
    {
        IPuzzleDataService _puzzleDataService;
        IUserService _userDataService;
        public PuzzleController(IPuzzleDataService puzzleDataService, IUserService userDataService)
        {
            _puzzleDataService = puzzleDataService;
            _userDataService = userDataService;
        }

        [HttpGet]
        [Route("ranked")]
        public async Task<IActionResult> GetRankedPuzzle()
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            if (username == null) return BadRequest();

            User user = await _userDataService.GetByUsername(username);

            return Ok(_puzzleDataService.GetRankedPuzzle(user.PuzzleRating));
        }

        [HttpGet]
        [Route("random")]
        public async Task<IActionResult> GetRandomPuzzle()
        {
            return Ok(_puzzleDataService.GetRandomPuzzle());
        }

        [HttpPut]
        [Route("ranked/result")]
        public async Task<IActionResult> PuzzleResult([FromBody] ChessPuzzleResult chessPuzzleResult)
        {
            Console.WriteLine("puzzle results");
            int newRating = 0;
            Console.WriteLine(1);

            var username = User.FindFirstValue(ClaimTypes.Name);
            if (username == null) return BadRequest();
            Console.WriteLine(2);

            if (chessPuzzleResult.HintUsed || chessPuzzleResult.PuzzleRevealed)
            {
                newRating = _puzzleDataService.AdjustPuzzleRating(username, false);
                Console.WriteLine(3);
                return Ok(newRating);
            }
            Console.WriteLine(4);

            var successful = _puzzleDataService.IsPuzzleSolved(chessPuzzleResult.PuzzleId, chessPuzzleResult.MovesMade);
            Console.WriteLine("puzzle successful: " + successful);

            newRating = _puzzleDataService.AdjustPuzzleRating(username, successful);
            
            Console.WriteLine("user new rating: " + newRating);

            return Ok(newRating);
        }


    }
}
