namespace JobTrack.Modules.FollowUps.Contracts;

public sealed record PendingFollowUpResponse(
    Guid Id,
    Guid JobApplicationId,
    string CompanyName,
    string RoleTitle,
    string Title,
    DateOnly DueDate,
    string? Notes,
    bool IsOverdue,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc);
