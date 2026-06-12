using API.Controllers;
using Backend.Application.DTO.User;
using Backend.Application.Responses;
using Backend.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Backend.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AuthService authService, UserService userService) : HomeController
{
    private readonly AuthService authService = authService;
    private readonly UserService userService = userService;

    [HttpPost]
    [Route("new")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest createUserRequest)
    {
        var response = await authService.Register(createUserRequest);

        if (response == null) {
            // build a response with all the validation errors
            if (userService.IsEmailInUse(createUserRequest.Email))
                ModelState.AddModelError("email", "Email is already in use");

            if (userService.GetByUsername(createUserRequest.Username) != null)
                ModelState.AddModelError("username", "Username is already in use");

            return ValidationProblem(); // sends a 400 bad request
        }

        var token = authService.CreateJWT(createUserRequest.Username);
        SetJwtCookie(Response, token);
        return Created();
    }

    [HttpPost]
    [Route("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest loginRequest)
    {
        var response = await authService.VerifyPassword(loginRequest);
        if (!response.Successful) return BadRequest("User cannot be logged in: Username or Password incorrect");
        var token = authService.CreateJWT(loginRequest.Username);
        SetJwtCookie(Response, token);
        return Ok();
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
            Expires = DateTimeOffset.UtcNow.AddHours(24) // Expiration time
        };

        response.Cookies.Append("access_token", token, cookieOptions);
    }

    // log in user
    // logout?
    // refresh JWT
}
