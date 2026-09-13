namespace JobTrack.Modules.Documents.Contracts;

public sealed record CoverLetterResponse(
    Guid Id,
    Guid JobApplicationId,
    string FileName,
    string ObjectKey,
    string ContentType,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc);
