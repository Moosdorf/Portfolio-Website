using API.Controllers;
using Backend.Application.DTO.User;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Backend.API.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class UserController : HomeController
{

    // update user
    // delete user
    // get user
}
