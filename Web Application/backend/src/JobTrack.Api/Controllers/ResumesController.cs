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
    [HttpPost]
    public async Task<ActionResult<ResumeResponse>> Save(
        SaveResumeRequest request,
        CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            return Unauthorized();
        }

        var response = await documentService.SaveResumeAsync(
            userId,
            request,
            cancellationToken);

        return StatusCode(StatusCodes.Status201Created, response);
    }
}
