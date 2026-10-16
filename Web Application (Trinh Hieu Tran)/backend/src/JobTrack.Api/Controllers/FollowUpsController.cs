using System.Security.Claims;
using JobTrack.Modules.FollowUps.Contracts;
using JobTrack.Modules.FollowUps.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobTrack.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/follow-ups")]
public sealed class FollowUpsController(IFollowUpService followUpService) : ControllerBase
{
    [HttpGet("pending")]
    public async Task<ActionResult<IReadOnlyList<PendingFollowUpResponse>>> GetPending(
        CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            return Unauthorized();
        }

        var response = await followUpService.GetPendingAsync(userId, cancellationToken);

        return Ok(response);
    }
}
