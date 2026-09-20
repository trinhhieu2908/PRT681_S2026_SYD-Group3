using System.Security.Claims;
using JobTrack.Modules.Interviews.Contracts;
using JobTrack.Modules.Interviews.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobTrack.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/job-applications/{jobApplicationId:guid}/interviews")]
public sealed class JobApplicationInterviewsController(IInterviewService interviewService)
    : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<InterviewResponse>> Create(
        Guid jobApplicationId,
        CreateInterviewRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var response = await interviewService.CreateAsync(
            userId,
            jobApplicationId,
            request,
            cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { jobApplicationId, interviewId = response.Id },
            response);
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<InterviewResponse>>> GetAll(
        Guid jobApplicationId,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var response = await interviewService.GetAllAsync(
            userId,
            jobApplicationId,
            cancellationToken);

        return Ok(response);
    }

    [HttpGet("{interviewId:guid}")]
    public async Task<ActionResult<InterviewResponse>> GetById(
        Guid jobApplicationId,
        Guid interviewId,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var response = await interviewService.GetByIdAsync(
            userId,
            jobApplicationId,
            interviewId,
            cancellationToken);

        return Ok(response);
    }

    [HttpPatch("{interviewId:guid}")]
    public async Task<ActionResult<InterviewResponse>> Update(
        Guid jobApplicationId,
        Guid interviewId,
        UpdateInterviewRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var response = await interviewService.UpdateAsync(
            userId,
            jobApplicationId,
            interviewId,
            request,
            cancellationToken);

        return Ok(response);
    }

    [HttpDelete("{interviewId:guid}")]
    public async Task<IActionResult> Delete(
        Guid jobApplicationId,
        Guid interviewId,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        await interviewService.DeleteAsync(
            userId,
            jobApplicationId,
            interviewId,
            cancellationToken);

        return NoContent();
    }

    private bool TryGetUserId(out Guid userId)
    {
        return Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out userId);
    }
}
