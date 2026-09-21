using JobTrack.Modules.JobApplication.Enums;

namespace JobTrack.Modules.Dashboard.Contracts;

public sealed record DashboardStatusCountResponse(
    JobApplicationStatus Status,
    int Count);
