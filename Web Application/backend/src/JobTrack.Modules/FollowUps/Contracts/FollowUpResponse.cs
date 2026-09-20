namespace JobTrack.Modules.FollowUps.Contracts;

public sealed record FollowUpResponse(
    Guid Id,
    Guid JobApplicationId,
    string Title,
    DateOnly DueDate,
    string? Notes,
    bool IsCompleted,
    DateTime? CompletedAtUtc,
    bool IsOverdue,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc);
