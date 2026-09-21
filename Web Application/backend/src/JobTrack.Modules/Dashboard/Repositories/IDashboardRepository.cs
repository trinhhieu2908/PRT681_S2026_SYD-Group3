using JobTrack.Modules.Dashboard.Models;
using JobTrack.Modules.FollowUps.Entities;
using JobTrack.Modules.Interviews.Entities;

namespace JobTrack.Modules.Dashboard.Repositories;

public interface IDashboardRepository
{
    Task<IReadOnlyList<DashboardStatusCount>> GetApplicationCountsByStatusAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<DashboardPlatformCount>> GetApplicationCountsByPlatformAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Interview>> GetUpcomingInterviewsAsync(
        Guid userId,
        DateTime fromUtc,
        DateTime toExclusiveUtc,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<FollowUp>> GetOverdueFollowUpsAsync(
        Guid userId,
        DateOnly today,
        CancellationToken cancellationToken = default);
}
