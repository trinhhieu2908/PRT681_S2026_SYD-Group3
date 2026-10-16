using System.Security.Claims;
using JobTrack.Modules.Interviews.Contracts;
using JobTrack.Modules.Interviews.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobTrack.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/interviews")]
public sealed class InterviewsController(IInterviewService interviewService) : ControllerBase
{
    [HttpGet("upcoming")]
    public async Task<ActionResult<IReadOnlyList<UpcomingInterviewResponse>>> GetUpcoming(
        [FromQuery] int days = 7,
        CancellationToken cancellationToken = default)
    {
        if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            return Unauthorized();
        }

        var response = await interviewService.GetUpcomingAsync(
            userId,
            days,
            cancellationToken);

        return Ok(response);
    }
}
