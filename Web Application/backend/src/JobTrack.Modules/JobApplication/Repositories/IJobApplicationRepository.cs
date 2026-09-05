using JobApplicationEntity = JobTrack.Modules.JobApplication.Entities.JobApplication;

namespace JobTrack.Modules.JobApplication.Repositories;

public interface IJobApplicationRepository
{
    Task AddAsync(
        JobApplicationEntity jobApplication,
        CancellationToken cancellationToken = default);

    Task<JobApplicationEntity?> GetByIdAndUserIdAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<JobApplicationEntity> Items, int TotalCount)> GetPagedAsync(
        JobApplicationQuery query,
        CancellationToken cancellationToken = default);
}
