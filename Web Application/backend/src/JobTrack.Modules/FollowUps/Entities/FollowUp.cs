using JobTrack.Core.Entities;
using JobApplicationEntity = JobTrack.Modules.JobApplication.Entities.JobApplication;

namespace JobTrack.Modules.FollowUps.Entities;

public sealed class FollowUp : BaseEntity
{
    public Guid JobApplicationId { get; set; }

    public JobApplicationEntity JobApplication { get; set; } = null!;

    public string Title { get; set; } = string.Empty;

    public DateOnly DueDate { get; set; }

    public string? Notes { get; set; }

    public bool IsCompleted { get; set; }

    public DateTime? CompletedAtUtc { get; set; }
}
