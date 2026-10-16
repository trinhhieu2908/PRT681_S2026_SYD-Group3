using JobTrack.Database.Persistence;
using JobTrack.Modules.JobApplication.Entities;
using JobTrack.Modules.JobApplication.Enums;
using JobTrack.Modules.JobApplication.Repositories;
using Microsoft.EntityFrameworkCore;

namespace JobTrack.Database.JobApplication;

public sealed class JobApplicationStatusHistoryRepository(JobTrackDbContext dbContext)
    : IJobApplicationStatusHistoryRepository
{
    public Task AddAsync(
        JobApplicationStatusHistory statusHistory,
        CancellationToken cancellationToken = default)
    {
        return dbContext.JobApplicationStatusHistories
            .AddAsync(statusHistory, cancellationToken)
            .AsTask();
    }

    public Task<JobApplicationStatusHistory?> GetLatestArchiveEntryAsync(
        Guid jobApplicationId,
        CancellationToken cancellationToken = default)
    {
        return dbContext.JobApplicationStatusHistories
            .AsNoTracking()
            .Where(history =>
                history.JobApplicationId == jobApplicationId
                && history.NewStatus == JobApplicationStatus.Archived)
            .OrderByDescending(history => history.CreatedAtUtc)
            .ThenByDescending(history => history.Id)
            .FirstOrDefaultAsync(cancellationToken);
    }
}
