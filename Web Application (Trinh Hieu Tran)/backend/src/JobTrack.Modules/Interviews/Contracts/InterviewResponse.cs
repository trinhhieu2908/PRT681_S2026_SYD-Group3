namespace JobTrack.Modules.Interviews.Contracts;

public sealed record InterviewResponse(
    Guid Id,
    Guid JobApplicationId,
    string Title,
    string InterviewType,
    DateTime ScheduledAtUtc,
    string? Location,
    string? MeetingLink,
    string? ContactName,
    string? ContactEmail,
    string? ContactPhone,
    string? Notes,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc);
