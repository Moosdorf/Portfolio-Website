using API.Controllers;
using Backend.Application.Chess;
using Backend.Application.Chess.Services;
using Microsoft.AspNetCore.Mvc;

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
            return Ok(_puzzleDataService.GetRandomPuzzle());
        }
    }
}
