using JobTrack.Database.Persistence;
using JobTrack.Modules.Interviews.Entities;
using JobTrack.Modules.Interviews.Repositories;
using Microsoft.EntityFrameworkCore;

namespace JobTrack.Database.Interviews;

public sealed class InterviewRepository(JobTrackDbContext dbContext) : IInterviewRepository
{
    public Task AddAsync(
        Interview interview,
        CancellationToken cancellationToken = default)
    {
        return dbContext.Interviews.AddAsync(interview, cancellationToken).AsTask();
    }

    public async Task<IReadOnlyList<Interview>> GetAllByJobApplicationAsync(
        Guid jobApplicationId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.Interviews
            .AsNoTracking()
            .Where(interview =>
                interview.JobApplicationId == jobApplicationId
                && interview.JobApplication.UserId == userId)
            .OrderBy(interview => interview.ScheduledAtUtc)
            .ThenBy(interview => interview.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public Task<Interview?> GetByIdAsync(
        Guid id,
        Guid jobApplicationId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return dbContext.Interviews
            .AsNoTracking()
            .SingleOrDefaultAsync(
                interview =>
                    interview.Id == id
                    && interview.JobApplicationId == jobApplicationId
                    && interview.JobApplication.UserId == userId,
                cancellationToken);
    }

    public Task<Interview?> GetForUpdateAsync(
        Guid id,
        Guid jobApplicationId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return dbContext.Interviews
            .SingleOrDefaultAsync(
                interview =>
                    interview.Id == id
                    && interview.JobApplicationId == jobApplicationId
                    && interview.JobApplication.UserId == userId,
                cancellationToken);
    }

    public async Task<IReadOnlyList<Interview>> GetUpcomingAsync(
        Guid userId,
        DateTime fromUtc,
        DateTime toUtc,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.Interviews
            .AsNoTracking()
            .Include(interview => interview.JobApplication)
            .Where(interview =>
                interview.JobApplication.UserId == userId
                && interview.ScheduledAtUtc >= fromUtc
                && interview.ScheduledAtUtc <= toUtc)
            .OrderBy(interview => interview.ScheduledAtUtc)
            .ThenBy(interview => interview.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public void Remove(Interview interview)
    {
        dbContext.Interviews.Remove(interview);
    }
}
