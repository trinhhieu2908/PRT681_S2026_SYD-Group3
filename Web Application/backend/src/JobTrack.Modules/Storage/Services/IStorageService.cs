using JobTrack.Modules.Storage.Contracts;

namespace JobTrack.Modules.Storage.Services;

public interface IStorageService
{
    Task<GenerateUploadPresignedUrlsResponse> GenerateUploadPresignedUrlsAsync(
        Guid userId,
        GenerateUploadPresignedUrlsRequest request,
        CancellationToken cancellationToken = default);

    Task<string> GetPresignedUrlAsync(
        string objectKey,
        CancellationToken cancellationToken = default);
}
