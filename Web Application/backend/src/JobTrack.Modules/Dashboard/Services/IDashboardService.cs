using JobTrack.Modules.Dashboard.Contracts;

namespace JobTrack.Modules.Dashboard.Services;

public interface IDashboardService
{
    Task<DashboardSummaryResponse> GetSummaryAsync(
        Guid userId,
        CancellationToken cancellationToken = default);
}
