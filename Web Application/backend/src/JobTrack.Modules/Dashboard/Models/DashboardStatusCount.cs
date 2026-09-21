using JobTrack.Modules.JobApplication.Enums;

namespace JobTrack.Modules.Dashboard.Models;

public sealed record DashboardStatusCount(
    JobApplicationStatus Status,
    int Count);
