using JobTrack.Modules.Dashboard.Contracts;
using JobTrack.Modules.Dashboard.Repositories;
using JobTrack.Modules.FollowUps.Contracts;
using JobTrack.Modules.FollowUps.Entities;
using JobTrack.Modules.Interviews.Contracts;
using JobTrack.Modules.Interviews.Entities;
using JobTrack.Modules.JobApplication.Enums;

namespace JobTrack.Modules.Dashboard.Services;

public sealed class DashboardService(
    IDashboardRepository dashboardRepository,
    TimeProvider timeProvider)
    : IDashboardService
{
    private static readonly JobApplicationStatus[] ActiveStatuses =
    [
        JobApplicationStatus.Applied,
        JobApplicationStatus.Interview,
        JobApplicationStatus.Offer,
        JobApplicationStatus.Rejected,
        JobApplicationStatus.Withdrawn,
    ];

    public async Task<DashboardSummaryResponse> GetSummaryAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var statusCounts = await dashboardRepository.GetApplicationCountsByStatusAsync(
            userId,
            cancellationToken);
        var platformCounts = await dashboardRepository.GetApplicationCountsByPlatformAsync(
            userId,
            cancellationToken);

        var nowUtc = timeProvider.GetUtcNow().UtcDateTime;
        var upcomingToExclusiveUtc = nowUtc.Date.AddDays(8);
        var today = DateOnly.FromDateTime(nowUtc);

        var upcomingInterviews = await dashboardRepository.GetUpcomingInterviewsAsync(
            userId,
            nowUtc,
            upcomingToExclusiveUtc,
            cancellationToken);
        var overdueFollowUps = await dashboardRepository.GetOverdueFollowUpsAsync(
            userId,
            today,
            cancellationToken);

        var countsByStatus = statusCounts.ToDictionary(item => item.Status, item => item.Count);
        var statusResponses = ActiveStatuses
            .Select(status => new DashboardStatusCountResponse(
                status,
                countsByStatus.GetValueOrDefault(status)))
            .ToArray();
        var platformResponses = platformCounts
            .Select(item => new DashboardPlatformCountResponse(item.Platform, item.Count))
            .ToArray();

        return new DashboardSummaryResponse(
            statusCounts.Sum(item => item.Count),
            statusResponses,
            platformResponses,
            upcomingInterviews.Select(MapUpcomingInterview).ToArray(),
            overdueFollowUps.Select(MapOverdueFollowUp).ToArray());
    }

    private static UpcomingInterviewResponse MapUpcomingInterview(Interview interview)
    {
        return new UpcomingInterviewResponse(
            interview.Id,
            interview.JobApplicationId,
            interview.JobApplication.CompanyName,
            interview.JobApplication.RoleTitle,
            interview.Title,
            interview.InterviewType,
            interview.ScheduledAtUtc,
            interview.Location,
            interview.MeetingLink,
            interview.ContactName,
            interview.ContactEmail,
            interview.ContactPhone,
            interview.Notes);
    }

    private static PendingFollowUpResponse MapOverdueFollowUp(FollowUp followUp)
    {
        return new PendingFollowUpResponse(
            followUp.Id,
            followUp.JobApplicationId,
            followUp.JobApplication.CompanyName,
            followUp.JobApplication.RoleTitle,
            followUp.Title,
            followUp.DueDate,
            followUp.Notes,
            true,
            followUp.CreatedAtUtc,
            followUp.UpdatedAtUtc);
    }
}
