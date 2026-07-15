using API.Controllers;
using Backend.Application.Chess;
using Backend.Application.Chess.DTO;
using Backend.Application.Chess.Services;
using Backend.Domain.Entities.Chess;
using DataLayer.csv_scripts;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace ChessServer.Controllers
{
    [ApiController]
    [Route("api/puzzle")]
    public class PuzzleController : HomeController
    {
        IPuzzleDataService _puzzleDataService;
        readonly LinkGenerator _linkGenerator;
        public PuzzleController(IPuzzleDataService puzzleDataService, LinkGenerator linkGenerator)
        {
            _puzzleDataService = puzzleDataService;
            _linkGenerator = linkGenerator;
        }

        [HttpGet]
        [Route("random")]
        public async Task<IActionResult> GetRandomPuzzle()
        {
            return Ok(JsonSerializer.Serialize(_puzzleDataService.GetRandomPuzzle()));
        }

        [HttpPut]
        [Route("move")]
        public async Task<IActionResult> GetNewPuzzleState([FromBody] PuzzleMove puzzleMove)
        {
            PuzzleDTO puzzle = _puzzleDataService.MovePuzzle(puzzleMove);
            return Ok(puzzle);
        }
    }
}
