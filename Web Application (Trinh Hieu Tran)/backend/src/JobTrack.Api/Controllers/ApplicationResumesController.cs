using System.Security.Claims;
using JobTrack.Modules.Documents.Contracts;
using JobTrack.Modules.Documents.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobTrack.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/job-applications/{jobApplicationId:guid}/resume")]
public sealed class ApplicationResumesController(IDocumentService documentService)
    : ControllerBase
{
    [HttpPut]
    public async Task<ActionResult<ResumeResponse>> Attach(
        Guid jobApplicationId,
        AttachResumeRequest request,
        CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            return Unauthorized();
        }

        var response = await documentService.AttachResumeAsync(
            userId,
            jobApplicationId,
            request,
            cancellationToken);

        return Ok(response);
    }
}
