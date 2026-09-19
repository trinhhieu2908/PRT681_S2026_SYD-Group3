namespace JobTrack.Modules.Storage.Contracts;

public sealed record UploadPresignedUrlResponse(
    string FileName,
    string ObjectKey,
    string UploadUrl,
    string HttpMethod,
    string ContentType,
    DateTime ExpiresAtUtc);
