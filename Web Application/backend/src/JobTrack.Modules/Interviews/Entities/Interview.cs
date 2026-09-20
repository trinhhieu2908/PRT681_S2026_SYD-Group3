using JobTrack.Core.Entities;
using JobApplicationEntity = JobTrack.Modules.JobApplication.Entities.JobApplication;

namespace JobTrack.Modules.Interviews.Entities;

public sealed class Interview : BaseEntity
{
    public Guid JobApplicationId { get; set; }

    public JobApplicationEntity JobApplication { get; set; } = null!;

    public string Title { get; set; } = string.Empty;

    public string InterviewType { get; set; } = string.Empty;

    public DateTime ScheduledAtUtc { get; set; }

    public string? Location { get; set; }

    public string? MeetingLink { get; set; }

    public string? ContactName { get; set; }

    public string? ContactEmail { get; set; }

    public string? ContactPhone { get; set; }

    public string? Notes { get; set; }
}
