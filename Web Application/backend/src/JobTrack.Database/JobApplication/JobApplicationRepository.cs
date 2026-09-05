using JobTrack.Database.Persistence;
using JobTrack.Modules.JobApplication.Repositories;
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

    public Task<JobApplicationEntity?> GetByIdAndUserIdAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return dbContext.JobApplications
            .AsNoTracking()
            .SingleOrDefaultAsync(
                jobApplication => jobApplication.Id == id && jobApplication.UserId == userId,
                cancellationToken);
    }

    public async Task<(IReadOnlyList<JobApplicationEntity> Items, int TotalCount)> GetPagedAsync(
        JobApplicationQuery query,
        CancellationToken cancellationToken = default)
    {
        var databaseQuery = dbContext.JobApplications
            .AsNoTracking()
            .Where(jobApplication => jobApplication.UserId == query.UserId);

        if (query.Search is not null)
        {
            var searchPattern = $"%{query.Search}%";
            databaseQuery = databaseQuery.Where(jobApplication =>
                EF.Functions.ILike(jobApplication.CompanyName, searchPattern)
                || EF.Functions.ILike(jobApplication.RoleTitle, searchPattern));
        }

        if (query.Status.HasValue)
        {
            databaseQuery = databaseQuery.Where(
                jobApplication => jobApplication.CurrentStatus == query.Status.Value);
        }

        if (query.Platform is not null)
        {
            databaseQuery = databaseQuery.Where(
                jobApplication => EF.Functions.ILike(jobApplication.Platform, query.Platform));
        }

        if (query.FromDate.HasValue)
        {
            databaseQuery = databaseQuery.Where(
                jobApplication => jobApplication.ApplicationDate >= query.FromDate.Value);
        }

        if (query.ToDate.HasValue)
        {
            databaseQuery = databaseQuery.Where(
                jobApplication => jobApplication.ApplicationDate <= query.ToDate.Value);
        }

        var totalCount = await databaseQuery.CountAsync(cancellationToken);
        var applications = await databaseQuery
            .OrderByDescending(jobApplication => jobApplication.ApplicationDate)
            .ThenByDescending(jobApplication => jobApplication.CreatedAtUtc)
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return (applications, totalCount);
    }
}
