using JobTrack.Modules.FollowUps.Contracts;
using JobTrack.Modules.Interviews.Contracts;

namespace JobTrack.Modules.Dashboard.Contracts;

public sealed record DashboardSummaryResponse(
    int ActiveApplicationCount,
    IReadOnlyList<DashboardStatusCountResponse> ApplicationsByStatus,
    IReadOnlyList<DashboardPlatformCountResponse> ApplicationsByPlatform,
    IReadOnlyList<UpcomingInterviewResponse> UpcomingInterviews,
    IReadOnlyList<PendingFollowUpResponse> OverdueFollowUps);
