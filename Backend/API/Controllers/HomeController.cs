using Backend.Application.Auth.Services;
using Backend.Application.General.Services;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HomeController : ControllerBase
{

}


[ApiController]
[Route("api/[controller]")]
public class ProjectsController(GeneralService genService) : HomeController
{
    [HttpGet("{id}")]
    public async Task<IActionResult> GetProject(int id)
    {
        var project = genService.GetProjectById(id);
        if (project == null) return BadRequest("Cannot find project");
        return Ok(project);
    }

    [HttpGet("")]
    public async Task<IActionResult> GetProjects()
    {
        var projects = genService.GetProjects();

        if (projects == null) return BadRequest("Cannot find project");
        return Ok(projects);
    }
}

