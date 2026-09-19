namespace JobTrack.Modules.Documents.Contracts;

public sealed record ResumeResponse(
    Guid Id,
    string FileName,
    string ObjectKey,
    string ContentType,
    string Url,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc);
