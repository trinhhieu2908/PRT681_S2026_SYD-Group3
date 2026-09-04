using JobTrack.Database.Persistence;
using Microsoft.EntityFrameworkCore;
using JobApplicationEntity = JobTrack.Modules.JobApplication.Entities.JobApplication;

namespace JobTrack.Database.JobApplication;

public sealed class JobApplicationRepository(JobTrackDbContext dbContext)
    : IJobApplicationRepository
{
    public Task AddAsync(
        JobApplicationEntity jobApplication,
        CancellationToken cancellationToken = default)
    {
        return dbContext.JobApplications.AddAsync(jobApplication, cancellationToken).AsTask();
    }

    public async Task<(IReadOnlyList<JobApplicationEntity> Items, int TotalCount)> GetPagedByUserIdAsync(
        Guid userId,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.JobApplications
            .AsNoTracking()
            .Where(application => application.UserId == userId);

        var totalCount = await query.CountAsync(cancellationToken);
        var applications = await query
            .OrderByDescending(application => application.ApplicationDate)
            .ThenByDescending(application => application.CreatedAtUtc)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (applications, totalCount);
    }
}
