using JobTrack.Common.Exceptions;
using JobTrack.Core.UnitOfWork;
using JobTrack.Modules.Interviews.Contracts;
using JobTrack.Modules.Interviews.Entities;
using JobTrack.Modules.Interviews.Repositories;
using JobTrack.Modules.JobApplication.Repositories;

namespace JobTrack.Modules.Interviews.Services;

public sealed class InterviewService(
    IInterviewRepository interviewRepository,
    IJobApplicationRepository jobApplicationRepository,
    IUnitOfWork unitOfWork)
    : IInterviewService
{
    private const int MaximumUpcomingDays = 30;

    public async Task<InterviewResponse> CreateAsync(
        Guid userId,
        Guid jobApplicationId,
        CreateInterviewRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureJobApplicationExistsAsync(jobApplicationId, userId, cancellationToken);

        var interview = new Interview
        {
            JobApplicationId = jobApplicationId,
            Title = ValidateRequired(request.Title, 150, "Title"),
            InterviewType = ValidateRequired(request.InterviewType, 100, "Interview type"),
            ScheduledAtUtc = ValidateScheduledAt(request.ScheduledAtUtc),
            Location = NormalizeOptional(request.Location),
            MeetingLink = NormalizeOptional(request.MeetingLink),
            ContactName = NormalizeOptional(request.ContactName),
            ContactEmail = NormalizeOptional(request.ContactEmail),
            ContactPhone = NormalizeOptional(request.ContactPhone),
            Notes = NormalizeOptional(request.Notes),
            CreatedAtUtc = DateTime.UtcNow,
        };

        await interviewRepository.AddAsync(interview, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return MapResponse(interview);
    }

    public async Task<IReadOnlyList<InterviewResponse>> GetAllAsync(
        Guid userId,
        Guid jobApplicationId,
        CancellationToken cancellationToken = default)
    {
        await EnsureJobApplicationExistsAsync(jobApplicationId, userId, cancellationToken);

        var interviews = await interviewRepository.GetAllByJobApplicationAsync(
            jobApplicationId,
            userId,
            cancellationToken);

        return interviews.Select(MapResponse).ToArray();
    }

    public async Task<InterviewResponse> GetByIdAsync(
        Guid userId,
        Guid jobApplicationId,
        Guid interviewId,
        CancellationToken cancellationToken = default)
    {
        var interview = await interviewRepository.GetByIdAsync(
            interviewId,
            jobApplicationId,
            userId,
            cancellationToken)
            ?? throw new NotFoundException("Interview was not found.");

        return MapResponse(interview);
    }

    public async Task<InterviewResponse> UpdateAsync(
        Guid userId,
        Guid jobApplicationId,
        Guid interviewId,
        UpdateInterviewRequest request,
        CancellationToken cancellationToken = default)
    {
        var interview = await interviewRepository.GetForUpdateAsync(
            interviewId,
            jobApplicationId,
            userId,
            cancellationToken)
            ?? throw new NotFoundException("Interview was not found.");

        var hasChanges = ApplyUpdates(interview, request);
        if (hasChanges)
        {
            interview.UpdatedAtUtc = DateTime.UtcNow;
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return MapResponse(interview);
    }

    public async Task DeleteAsync(
        Guid userId,
        Guid jobApplicationId,
        Guid interviewId,
        CancellationToken cancellationToken = default)
    {
        var interview = await interviewRepository.GetForUpdateAsync(
            interviewId,
            jobApplicationId,
            userId,
            cancellationToken)
            ?? throw new NotFoundException("Interview was not found.");

        interviewRepository.Remove(interview);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<UpcomingInterviewResponse>> GetUpcomingAsync(
        Guid userId,
        int days,
        CancellationToken cancellationToken = default)
    {
        if (days is < 1 or > MaximumUpcomingDays)
        {
            throw new ValidationException(
                $"Upcoming interview days must be between 1 and {MaximumUpcomingDays}.");
        }

        var fromUtc = DateTime.UtcNow;
        var toUtc = fromUtc.AddDays(days);
        var interviews = await interviewRepository.GetUpcomingAsync(
            userId,
            fromUtc,
            toUtc,
            cancellationToken);

        return interviews.Select(MapUpcomingResponse).ToArray();
    }

    private async Task EnsureJobApplicationExistsAsync(
        Guid jobApplicationId,
        Guid userId,
        CancellationToken cancellationToken)
    {
        if (!await jobApplicationRepository.ExistsAsync(
                jobApplicationId,
                userId,
                cancellationToken))
        {
            throw new NotFoundException("Job application was not found.");
        }
    }

    private static bool ApplyUpdates(Interview interview, UpdateInterviewRequest request)
    {
        var hasChanges = false;

        if (request.Title is not null)
        {
            interview.Title = ValidateRequired(request.Title, 150, "Title");
            hasChanges = true;
        }

        if (request.InterviewType is not null)
        {
            interview.InterviewType = ValidateRequired(
                request.InterviewType,
                100,
                "Interview type");
            hasChanges = true;
        }

        if (request.ScheduledAtUtc.HasValue)
        {
            interview.ScheduledAtUtc = request.ScheduledAtUtc.Value.UtcDateTime;
            hasChanges = true;
        }

        hasChanges |= ApplyOptional(request.Location, value => interview.Location = value);
        hasChanges |= ApplyOptional(request.MeetingLink, value => interview.MeetingLink = value);
        hasChanges |= ApplyOptional(request.ContactName, value => interview.ContactName = value);
        hasChanges |= ApplyOptional(request.ContactEmail, value => interview.ContactEmail = value);
        hasChanges |= ApplyOptional(request.ContactPhone, value => interview.ContactPhone = value);
        hasChanges |= ApplyOptional(request.Notes, value => interview.Notes = value);

        return hasChanges;
    }

    private static bool ApplyOptional(string? requestValue, Action<string?> apply)
    {
        if (requestValue is null)
        {
            return false;
        }

        apply(NormalizeOptional(requestValue));
        return true;
    }

    private static DateTime ValidateScheduledAt(DateTimeOffset? scheduledAtUtc)
    {
        return scheduledAtUtc?.UtcDateTime
            ?? throw new ValidationException("Scheduled date and time are required.");
    }

    private static string ValidateRequired(string value, int maximumLength, string fieldName)
    {
        var normalizedValue = value?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(normalizedValue))
        {
            throw new ValidationException($"{fieldName} is required.");
        }

        if (normalizedValue.Length > maximumLength)
        {
            throw new ValidationException($"{fieldName} cannot exceed {maximumLength} characters.");
        }

        return normalizedValue;
    }

    private static string? NormalizeOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

    private static InterviewResponse MapResponse(Interview interview)
    {
        return new InterviewResponse(
            interview.Id,
            interview.JobApplicationId,
            interview.Title,
            interview.InterviewType,
            interview.ScheduledAtUtc,
            interview.Location,
            interview.MeetingLink,
            interview.ContactName,
            interview.ContactEmail,
            interview.ContactPhone,
            interview.Notes,
            interview.CreatedAtUtc,
            interview.UpdatedAtUtc);
    }

    private static UpcomingInterviewResponse MapUpcomingResponse(Interview interview)
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
}
