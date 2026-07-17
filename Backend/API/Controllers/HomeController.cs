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
public class ProjectsController(IGeneralService genService) : HomeController
{
    [HttpGet("{id}")]
    public async Task<IActionResult> GetProject(int id)
    {
        var project = await genService.GetProjectById(id);
        if (project == null) return NotFound("Cannot find project");
        return Ok(project);
    }

    [HttpGet("")]
    public async Task<IActionResult> GetProjects()
    {
        var projects = await genService.GetProjects();

        if (projects == null || projects.Count == 0) return NotFound("Cannot find project");
        return Ok(projects);
    }
}

