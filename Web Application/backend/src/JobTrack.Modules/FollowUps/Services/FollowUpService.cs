using JobTrack.Common.Exceptions;
using JobTrack.Core.UnitOfWork;
using JobTrack.Modules.FollowUps.Contracts;
using JobTrack.Modules.FollowUps.Entities;
using JobTrack.Modules.FollowUps.Repositories;
using JobTrack.Modules.JobApplication.Repositories;

namespace JobTrack.Modules.FollowUps.Services;

public sealed class FollowUpService(
    IFollowUpRepository followUpRepository,
    IJobApplicationRepository jobApplicationRepository,
    IUnitOfWork unitOfWork)
    : IFollowUpService
{
    public async Task<FollowUpResponse> CreateAsync(
        Guid userId,
        Guid jobApplicationId,
        CreateFollowUpRequest request,
        CancellationToken cancellationToken = default)
    {
        await EnsureJobApplicationExistsAsync(jobApplicationId, userId, cancellationToken);

        var now = DateTime.UtcNow;
        var today = DateOnly.FromDateTime(now);
        var followUp = new FollowUp
        {
            JobApplicationId = jobApplicationId,
            Title = ValidateRequired(request.Title, 150, "Title"),
            DueDate = ValidateDueDate(request.DueDate, today),
            Notes = NormalizeOptional(request.Notes),
            IsCompleted = false,
            CreatedAtUtc = now,
        };

        await followUpRepository.AddAsync(followUp, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return MapResponse(followUp, today);
    }

    public async Task<IReadOnlyList<FollowUpResponse>> GetAllAsync(
        Guid userId,
        Guid jobApplicationId,
        CancellationToken cancellationToken = default)
    {
        await EnsureJobApplicationExistsAsync(jobApplicationId, userId, cancellationToken);

        var followUps = await followUpRepository.GetAllByJobApplicationAsync(
            jobApplicationId,
            userId,
            cancellationToken);
        var today = GetTodayUtc();

        return followUps.Select(followUp => MapResponse(followUp, today)).ToArray();
    }

    public async Task<FollowUpResponse> GetByIdAsync(
        Guid userId,
        Guid jobApplicationId,
        Guid followUpId,
        CancellationToken cancellationToken = default)
    {
        var followUp = await followUpRepository.GetByIdAsync(
            followUpId,
            jobApplicationId,
            userId,
            cancellationToken)
            ?? throw new NotFoundException("Follow-up was not found.");

        return MapResponse(followUp, GetTodayUtc());
    }

    public async Task<FollowUpResponse> UpdateAsync(
        Guid userId,
        Guid jobApplicationId,
        Guid followUpId,
        UpdateFollowUpRequest request,
        CancellationToken cancellationToken = default)
    {
        var followUp = await GetForUpdateAsync(
            followUpId,
            jobApplicationId,
            userId,
            cancellationToken);
        var today = GetTodayUtc();
        var hasChanges = ApplyUpdates(followUp, request, today);

        if (hasChanges)
        {
            followUp.UpdatedAtUtc = DateTime.UtcNow;
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return MapResponse(followUp, today);
    }

    public async Task<FollowUpResponse> UpdateCompletionAsync(
        Guid userId,
        Guid jobApplicationId,
        Guid followUpId,
        UpdateFollowUpCompletionRequest request,
        CancellationToken cancellationToken = default)
    {
        var isCompleted = request.IsCompleted
            ?? throw new ValidationException("Completion state is required.");
        var followUp = await GetForUpdateAsync(
            followUpId,
            jobApplicationId,
            userId,
            cancellationToken);

        if (followUp.IsCompleted != isCompleted)
        {
            var now = DateTime.UtcNow;
            followUp.IsCompleted = isCompleted;
            followUp.CompletedAtUtc = isCompleted ? now : null;
            followUp.UpdatedAtUtc = now;
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return MapResponse(followUp, GetTodayUtc());
    }

    public async Task DeleteAsync(
        Guid userId,
        Guid jobApplicationId,
        Guid followUpId,
        CancellationToken cancellationToken = default)
    {
        var followUp = await GetForUpdateAsync(
            followUpId,
            jobApplicationId,
            userId,
            cancellationToken);

        followUpRepository.Remove(followUp);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<PendingFollowUpResponse>> GetPendingAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var followUps = await followUpRepository.GetPendingAsync(userId, cancellationToken);
        var today = GetTodayUtc();

        return followUps.Select(followUp => MapPendingResponse(followUp, today)).ToArray();
    }

    private async Task<FollowUp> GetForUpdateAsync(
        Guid followUpId,
        Guid jobApplicationId,
        Guid userId,
        CancellationToken cancellationToken)
    {
        return await followUpRepository.GetForUpdateAsync(
            followUpId,
            jobApplicationId,
            userId,
            cancellationToken)
            ?? throw new NotFoundException("Follow-up was not found.");
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

    private static bool ApplyUpdates(
        FollowUp followUp,
        UpdateFollowUpRequest request,
        DateOnly today)
    {
        var hasChanges = false;

        if (request.Title is not null)
        {
            followUp.Title = ValidateRequired(request.Title, 150, "Title");
            hasChanges = true;
        }

        if (request.DueDate.HasValue)
        {
            followUp.DueDate = ValidateDueDate(request.DueDate, today);
            hasChanges = true;
        }

        if (request.Notes is not null)
        {
            followUp.Notes = NormalizeOptional(request.Notes);
            hasChanges = true;
        }

        return hasChanges;
    }

    private static DateOnly ValidateDueDate(DateOnly? dueDate, DateOnly today)
    {
        var value = dueDate
            ?? throw new ValidationException("Follow-up due date is required.");

        if (value < today)
        {
            throw new ValidationException("Follow-up due date cannot be in the past.");
        }

        return value;
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

    private static DateOnly GetTodayUtc()
    {
        return DateOnly.FromDateTime(DateTime.UtcNow);
    }

    private static FollowUpResponse MapResponse(FollowUp followUp, DateOnly today)
    {
        return new FollowUpResponse(
            followUp.Id,
            followUp.JobApplicationId,
            followUp.Title,
            followUp.DueDate,
            followUp.Notes,
            followUp.IsCompleted,
            followUp.CompletedAtUtc,
            IsOverdue(followUp, today),
            followUp.CreatedAtUtc,
            followUp.UpdatedAtUtc);
    }

    private static PendingFollowUpResponse MapPendingResponse(
        FollowUp followUp,
        DateOnly today)
    {
        return new PendingFollowUpResponse(
            followUp.Id,
            followUp.JobApplicationId,
            followUp.JobApplication.CompanyName,
            followUp.JobApplication.RoleTitle,
            followUp.Title,
            followUp.DueDate,
            followUp.Notes,
            IsOverdue(followUp, today),
            followUp.CreatedAtUtc,
            followUp.UpdatedAtUtc);
    }

    private static bool IsOverdue(FollowUp followUp, DateOnly today)
    {
        return !followUp.IsCompleted && followUp.DueDate < today;
    }
}
