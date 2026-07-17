using API.Controllers;
using Backend.Application.Chess;
using Backend.Application.Chess.DTO;
using Backend.Application.Chess.Services;
using Backend.Application.Users.Services;
using Backend.Domain.Entities.Chess;
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
        public async Task<IActionResult> GetRankedPuzzle([FromBody] int rating)
        {
            var username = User.FindFirstValue(ClaimTypes.Name);
            if (username == null) return BadRequest();

            User user = await _userDataService.GetByUsername(username);

            return Ok(_puzzleDataService.GetRankedPuzzle(rating));
        }

        [HttpGet]
        [Route("random")]
        public async Task<IActionResult> GetRandomPuzzle()
        {
            return Ok(_puzzleDataService.GetRandomPuzzle());
        }


    }
}
