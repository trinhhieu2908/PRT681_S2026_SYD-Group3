using System.Security.Claims;
using JobTrack.Modules.Documents.Contracts;
using JobTrack.Modules.Documents.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobTrack.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/resumes")]
public sealed class ResumesController(IDocumentService documentService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ResumeResponse>>> GetAll(
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var response = await documentService.GetResumesAsync(
            userId,
            cancellationToken);

        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<ResumeResponse>> Save(
        SaveResumeRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetUserId(out var userId))
        {
            return Unauthorized();
        }

        var response = await documentService.SaveResumeAsync(
            userId,
            request,
            cancellationToken);

        return StatusCode(StatusCodes.Status201Created, response);
    }

    private bool TryGetUserId(out Guid userId)
    {
        return Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out userId);
    }
}
