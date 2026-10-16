using System.Security.Claims;
using JobTrack.Modules.Storage.Contracts;
using JobTrack.Modules.Storage.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobTrack.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/storage")]
public sealed class StorageController(IStorageService storageService) : ControllerBase
{
    [HttpPost("upload-presigned-urls")]
    public async Task<ActionResult<GenerateUploadPresignedUrlsResponse>>
        GenerateUploadPresignedUrls(
            GenerateUploadPresignedUrlsRequest request,
            CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
        {
            return Unauthorized();
        }

        var response = await storageService.GenerateUploadPresignedUrlsAsync(
            userId,
            request,
            cancellationToken);

        return Ok(response);
    }
}
