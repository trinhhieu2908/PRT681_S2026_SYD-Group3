using JobTrack.Database.Persistence;
using JobTrack.Modules.Dashboard.Models;
using JobTrack.Modules.Dashboard.Repositories;
using JobTrack.Modules.FollowUps.Entities;
using JobTrack.Modules.Interviews.Entities;
using JobTrack.Modules.JobApplication.Enums;
using Microsoft.EntityFrameworkCore;

namespace JobTrack.Database.Dashboard;

public sealed class DashboardRepository(JobTrackDbContext dbContext) : IDashboardRepository
{
    public async Task<IReadOnlyList<DashboardStatusCount>> GetApplicationCountsByStatusAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.JobApplications
            .AsNoTracking()
            .Where(jobApplication =>
                jobApplication.UserId == userId
                && jobApplication.CurrentStatus != JobApplicationStatus.Archived)
            .GroupBy(jobApplication => jobApplication.CurrentStatus)
            .Select(group => new DashboardStatusCount(group.Key, group.Count()))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<DashboardPlatformCount>> GetApplicationCountsByPlatformAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var rawCounts = await dbContext.JobApplications
            .AsNoTracking()
            .Where(jobApplication =>
                jobApplication.UserId == userId
                && jobApplication.CurrentStatus != JobApplicationStatus.Archived)
            .GroupBy(jobApplication => jobApplication.Platform)
            .Select(group => new DashboardPlatformCount(group.Key, group.Count()))
            .ToListAsync(cancellationToken);

        return rawCounts
            .GroupBy(item => item.Platform.Trim(), StringComparer.OrdinalIgnoreCase)
            .Select(group => new DashboardPlatformCount(
                group
                    .OrderByDescending(item => item.Count)
                    .ThenBy(item => item.Platform, StringComparer.OrdinalIgnoreCase)
                    .First()
                    .Platform,
                group.Sum(item => item.Count)))
            .OrderByDescending(item => item.Count)
            .ThenBy(item => item.Platform, StringComparer.OrdinalIgnoreCase)
            .ToArray();
    }

    public async Task<IReadOnlyList<Interview>> GetUpcomingInterviewsAsync(
        Guid userId,
        DateTime fromUtc,
        DateTime toExclusiveUtc,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.Interviews
            .AsNoTracking()
            .Include(interview => interview.JobApplication)
            .Where(interview =>
                interview.JobApplication.UserId == userId
                && interview.ScheduledAtUtc >= fromUtc
                && interview.ScheduledAtUtc < toExclusiveUtc)
            .OrderBy(interview => interview.ScheduledAtUtc)
            .ThenBy(interview => interview.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<FollowUp>> GetOverdueFollowUpsAsync(
        Guid userId,
        DateOnly today,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.FollowUps
            .AsNoTracking()
            .Include(followUp => followUp.JobApplication)
            .Where(followUp =>
                followUp.JobApplication.UserId == userId
                && !followUp.IsCompleted
                && followUp.DueDate < today)
            .OrderBy(followUp => followUp.DueDate)
            .ThenBy(followUp => followUp.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }
}
