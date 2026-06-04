using Microsoft.AspNetCore.Mvc;

namespace Portfolio_BE.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HomeController : ControllerBase
{
    // Your home endpoints will go here
}

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok("Backend is working!");
    }
}