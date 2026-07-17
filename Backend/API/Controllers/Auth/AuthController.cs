using API.Controllers;
using Backend.Application.Auth.DTO;
using Backend.Application.Auth.Services;
using Backend.Application.Users.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Backend.API.Controllers.Auth;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService authService, IUserService userService) : HomeController()
{
    private readonly IAuthService _authService = authService;
    private readonly IUserService _userService = userService;

    [HttpPost]
    [Route("new")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest createUserRequest)
    {
        var response = await _authService.Register(createUserRequest);

        if (response == null) {
            // build a response with all the validation errors
            if (await _userService.IsEmailInUse(createUserRequest.Email) != null)
                ModelState.AddModelError("email", "Email is already in use");

            if (await _userService.GetByUsername(createUserRequest.Username) != null)
                ModelState.AddModelError("username", "Username is already in use");

            return ValidationProblem(); // sends a 400 bad request
        }

        var token = _authService.CreateJWT(createUserRequest.Username);
        SetJwtCookie(Response, token);
        return Created("", new { JWT = token });
    }

    [HttpPost]
    [Route("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
    {
        var response = await _authService.VerifyPassword(loginRequest);

        if (response == null) return BadRequest("Server error");
        if (!response.Successful) {
            var message = "";
            if (response.Error == "Login")
                message = "User cannot be logged in: Username or Password incorrect";
            if (response.Error == "Server")
                message = "Server is not responding";

            return BadRequest(message);
        }
        var token = _authService.CreateJWT(loginRequest.Username);
        SetJwtCookie(Response, token);
        return Ok(new { JWT = token});
    }


    [HttpPost]
    [Authorize]
    [Route("logout")]
    public async Task<IActionResult> Logout()
    {
        var username = User.FindFirstValue(ClaimTypes.Name);
        ClearJwtCookie(Response);

        return Ok();
    }

    [HttpGet]
    [Authorize]
    [Route("me")]
    public async Task<IActionResult> IsUserLoggedIn()
    {
        var username = User.FindFirstValue(ClaimTypes.Name);

        Console.WriteLine("is user logged in: " + username);
        var user = await _userService.GetByUsername(username);
        return Ok(new
        {
            user.Id,
            user.Username,
            user.Email
        });
    }

    [NonAction]
    public void ClearJwtCookie(HttpResponse response)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,              
            SameSite = SameSiteMode.None,
            Path = "/",                 
            Expires = DateTimeOffset.UtcNow.AddHours(-1) 
        };

        response.Cookies.Append("access_token", "0", cookieOptions);
    }

    [NonAction]
    public void SetJwtCookie(HttpResponse response, string token)
    {
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,              // Only send cookie over HTTPS
            SameSite = SameSiteMode.None,
            Path = "/",                 // Cookie path scope
            Domain = null,
            Expires = DateTimeOffset.UtcNow.AddHours(24) // Expiration time
        };

        response.Cookies.Append("access_token", token, cookieOptions);
    }

}
