namespace JobTrack.Modules.Storage.Contracts;

public sealed record GenerateUploadPresignedUrlsResponse(
    IReadOnlyList<UploadPresignedUrlResponse> Uploads);
