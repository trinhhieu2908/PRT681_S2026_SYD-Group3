using JobApplicationEntity = JobTrack.Modules.JobApplication.Entities.JobApplication;

namespace JobTrack.Modules.JobApplication.Repositories;

public interface IJobApplicationRepository
{
    Task AddAsync(
        JobApplicationEntity jobApplication,
        CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<JobApplicationEntity> Items, int TotalCount)> GetPagedByUserIdAsync(
        Guid userId,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default);
}
