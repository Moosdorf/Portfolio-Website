using API.Controllers;
using Backend.Application.General.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.API.Controllers.User;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class UserController : HomeController
{

    // update user
    // delete user
    // get user
    public UserController()
    {
    }
}
