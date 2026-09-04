using JobTrack.Core.Entities;
using JobTrack.Modules.JobApplication.Enums;

namespace JobTrack.Modules.JobApplication.Entities;

public sealed class JobApplication : BaseEntity
{
    public Guid UserId { get; set; }

    public string CompanyName { get; set; } = string.Empty;

    public string RoleTitle { get; set; } = string.Empty;

    public string Platform { get; set; } = string.Empty;

    public DateOnly ApplicationDate { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);

    public JobApplicationStatus CurrentStatus { get; set; } = JobApplicationStatus.Applied;

    public string? JobLink { get; set; }

    public string? PortfolioLink { get; set; }

    public string? GitHubLink { get; set; }
}
