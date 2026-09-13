namespace JobTrack.Modules.Documents.Contracts;

public sealed record ResumeResponse(
    Guid Id,
    string FileName,
    string ObjectKey,
    string ContentType,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc);
