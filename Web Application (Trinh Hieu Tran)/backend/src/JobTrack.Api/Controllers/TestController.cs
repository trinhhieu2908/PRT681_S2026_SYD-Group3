using Microsoft.AspNetCore.Mvc;

namespace JobTrack.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    [HttpGet("welcome")]
    public IActionResult Welcome()
    {
        return Ok(new
        {
            message = "Welcome to JobTrack API"
        });
    }
}
