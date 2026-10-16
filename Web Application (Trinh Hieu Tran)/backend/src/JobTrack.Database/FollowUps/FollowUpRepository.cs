using JobTrack.Database.Persistence;
using JobTrack.Modules.FollowUps.Entities;
using JobTrack.Modules.FollowUps.Repositories;
using Microsoft.EntityFrameworkCore;

namespace JobTrack.Database.FollowUps;

public sealed class FollowUpRepository(JobTrackDbContext dbContext) : IFollowUpRepository
{
    public Task AddAsync(
        FollowUp followUp,
        CancellationToken cancellationToken = default)
    {
        return dbContext.FollowUps.AddAsync(followUp, cancellationToken).AsTask();
    }

    public async Task<IReadOnlyList<FollowUp>> GetAllByJobApplicationAsync(
        Guid jobApplicationId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.FollowUps
            .AsNoTracking()
            .Where(followUp =>
                followUp.JobApplicationId == jobApplicationId
                && followUp.JobApplication.UserId == userId)
            .OrderBy(followUp => followUp.IsCompleted)
            .ThenBy(followUp => followUp.DueDate)
            .ThenBy(followUp => followUp.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public Task<FollowUp?> GetByIdAsync(
        Guid id,
        Guid jobApplicationId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return dbContext.FollowUps
            .AsNoTracking()
            .SingleOrDefaultAsync(
                followUp =>
                    followUp.Id == id
                    && followUp.JobApplicationId == jobApplicationId
                    && followUp.JobApplication.UserId == userId,
                cancellationToken);
    }

    public Task<FollowUp?> GetForUpdateAsync(
        Guid id,
        Guid jobApplicationId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return dbContext.FollowUps
            .SingleOrDefaultAsync(
                followUp =>
                    followUp.Id == id
                    && followUp.JobApplicationId == jobApplicationId
                    && followUp.JobApplication.UserId == userId,
                cancellationToken);
    }

    public async Task<IReadOnlyList<FollowUp>> GetPendingAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.FollowUps
            .AsNoTracking()
            .Include(followUp => followUp.JobApplication)
            .Where(followUp =>
                followUp.JobApplication.UserId == userId
                && !followUp.IsCompleted)
            .OrderBy(followUp => followUp.DueDate)
            .ThenBy(followUp => followUp.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public void Remove(FollowUp followUp)
    {
        dbContext.FollowUps.Remove(followUp);
    }
}
