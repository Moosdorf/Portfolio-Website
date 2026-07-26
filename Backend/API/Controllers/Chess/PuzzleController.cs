using API.Controllers;
using AutoMapper;
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
        IMapper _mapper;
        public PuzzleController(IPuzzleDataService puzzleDataService, IUserService userDataService, IMapper mapper)
        {
            _puzzleDataService = puzzleDataService;
            _userDataService = userDataService;
            _mapper = mapper;
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
            var username = User.FindFirstValue(ClaimTypes.Name);
            if (username == null) return BadRequest();

            var puzzleAttempt = _puzzleDataService.IsPuzzleSolved(username, chessPuzzleResult);
            if (puzzleAttempt == null) return BadRequest("Cannot process puzzle result");

            return Ok(_mapper.Map<PuzzleAttemptDTO>(puzzleAttempt));
        }

    }

}
