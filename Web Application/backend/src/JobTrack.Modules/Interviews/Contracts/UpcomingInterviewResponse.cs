namespace JobTrack.Modules.Interviews.Contracts;

public sealed record UpcomingInterviewResponse(
    Guid Id,
    Guid JobApplicationId,
    string CompanyName,
    string RoleTitle,
    string Title,
    string InterviewType,
    DateTime ScheduledAtUtc,
    string? Location,
    string? MeetingLink,
    string? ContactName,
    string? ContactEmail,
    string? ContactPhone,
    string? Notes);
