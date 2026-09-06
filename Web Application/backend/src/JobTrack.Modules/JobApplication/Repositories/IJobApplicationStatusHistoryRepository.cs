using JobTrack.Modules.JobApplication.Entities;

namespace JobTrack.Modules.JobApplication.Repositories;

public interface IJobApplicationStatusHistoryRepository
{
    Task AddAsync(
        JobApplicationStatusHistory statusHistory,
        CancellationToken cancellationToken = default);

    Task<JobApplicationStatusHistory?> GetLatestArchiveEntryAsync(
        Guid jobApplicationId,
        CancellationToken cancellationToken = default);
}
