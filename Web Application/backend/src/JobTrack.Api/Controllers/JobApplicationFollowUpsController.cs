using System.Security.Claims;
using JobTrack.Modules.FollowUps.Contracts;
using JobTrack.Modules.FollowUps.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobTrack.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/job-applications/{jobApplicationId:guid}/follow-ups")]
public sealed class JobApplicationFollowUpsController(IFollowUpService followUpService)
    : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<FollowUpResponse>> Create(
        Guid jobApplicationId,
        CreateFollowUpRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var response = await followUpService.CreateAsync(
            userId,
            jobApplicationId,
            request,
            cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { jobApplicationId, followUpId = response.Id },
            response);
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<FollowUpResponse>>> GetAll(
        Guid jobApplicationId,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var response = await followUpService.GetAllAsync(
            userId,
            jobApplicationId,
            cancellationToken);

        return Ok(response);
    }

    [HttpGet("{followUpId:guid}")]
    public async Task<ActionResult<FollowUpResponse>> GetById(
        Guid jobApplicationId,
        Guid followUpId,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var response = await followUpService.GetByIdAsync(
            userId,
            jobApplicationId,
            followUpId,
            cancellationToken);

        return Ok(response);
    }

    [HttpPatch("{followUpId:guid}")]
    public async Task<ActionResult<FollowUpResponse>> Update(
        Guid jobApplicationId,
        Guid followUpId,
        UpdateFollowUpRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var response = await followUpService.UpdateAsync(
            userId,
            jobApplicationId,
            followUpId,
            request,
            cancellationToken);

        return Ok(response);
    }

    [HttpPatch("{followUpId:guid}/completion")]
    public async Task<ActionResult<FollowUpResponse>> UpdateCompletion(
        Guid jobApplicationId,
        Guid followUpId,
        UpdateFollowUpCompletionRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var response = await followUpService.UpdateCompletionAsync(
            userId,
            jobApplicationId,
            followUpId,
            request,
            cancellationToken);

        return Ok(response);
    }

    [HttpDelete("{followUpId:guid}")]
    public async Task<IActionResult> Delete(
        Guid jobApplicationId,
        Guid followUpId,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        await followUpService.DeleteAsync(
            userId,
            jobApplicationId,
            followUpId,
            cancellationToken);

        return NoContent();
    }

    private bool TryGetUserId(out Guid userId)
    {
        return Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out userId);
    }
}
