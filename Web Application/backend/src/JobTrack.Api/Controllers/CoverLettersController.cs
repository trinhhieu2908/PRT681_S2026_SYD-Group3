using System.Security.Claims;
using JobTrack.Modules.Documents.Contracts;
using JobTrack.Modules.Documents.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobTrack.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/job-applications/{jobApplicationId:guid}/cover-letter")]
public sealed class CoverLettersController(IDocumentService documentService) : ControllerBase
{
    [HttpPut]
    public async Task<ActionResult<CoverLetterResponse>> Save(
        Guid jobApplicationId,
        SaveCoverLetterRequest request,
        CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            return Unauthorized();
        }

        var response = await documentService.SaveCoverLetterAsync(
            userId,
            jobApplicationId,
            request,
            cancellationToken);

        return Ok(response);
    }
}
