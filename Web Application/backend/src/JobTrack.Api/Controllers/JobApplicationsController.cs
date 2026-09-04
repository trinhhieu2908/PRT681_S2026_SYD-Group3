using System.Security.Claims;
using JobTrack.Common.Pagination;
using JobTrack.Modules.JobApplication.Contracts;
using JobTrack.Modules.JobApplication.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobTrack.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/job-applications")]
public sealed class JobApplicationsController(IJobApplicationService jobApplicationService)
    : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<JobApplicationResponse>> Create(
        CreateJobApplicationRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var response = await jobApplicationService.CreateAsync(
            userId,
            request,
            cancellationToken);

        return StatusCode(StatusCodes.Status201Created, response);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<JobApplicationResponse>>> GetAll(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var response = await jobApplicationService.GetAllAsync(
            userId,
            pageNumber,
            pageSize,
            cancellationToken);

        return Ok(response);
    }

    private bool TryGetUserId(out Guid userId)
    {
        return Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out userId);
    }
}
