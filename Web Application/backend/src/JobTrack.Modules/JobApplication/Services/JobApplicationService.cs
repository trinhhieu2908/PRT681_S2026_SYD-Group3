using JobTrack.Common.Exceptions;
using JobTrack.Common.Pagination;
using JobTrack.Core.UnitOfWork;
using JobTrack.Modules.JobApplication.Contracts;
using JobTrack.Modules.JobApplication.Entities;
using JobTrack.Modules.JobApplication.Enums;
using JobTrack.Modules.JobApplication.Repositories;
using JobApplicationEntity = JobTrack.Modules.JobApplication.Entities.JobApplication;

namespace JobTrack.Modules.JobApplication.Services;

public sealed class JobApplicationService(
    IJobApplicationRepository jobApplicationRepository,
    IJobApplicationStatusHistoryRepository statusHistoryRepository,
    IUnitOfWork unitOfWork)
    : IJobApplicationService
{
    private const int MaximumPageSize = 100;

    public async Task<JobApplicationResponse> CreateAsync(
        Guid userId,
        CreateJobApplicationRequest request,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var application = new JobApplicationEntity
        {
            UserId = userId,
            CompanyName = ValidateRequired(request.CompanyName, 150, "Company name"),
            RoleTitle = ValidateRequired(request.RoleTitle, 150, "Role title"),
            Platform = ValidateRequired(request.Platform, 50, "Platform"),
            ApplicationDate = DateOnly.FromDateTime(now),
            CurrentStatus = JobApplicationStatus.Applied,
            JobLink = NormalizeOptional(request.JobLink),
            PortfolioLink = NormalizeOptional(request.PortfolioLink),
            GitHubLink = NormalizeOptional(request.GitHubLink),
            CreatedAtUtc = now,
        };

        await jobApplicationRepository.AddAsync(application, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return MapResponse(application);
    }

    public async Task<JobApplicationResponse> GetByIdAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var jobApplication = await jobApplicationRepository.GetByIdAndUserIdAsync(
            id,
            userId,
            cancellationToken)
            ?? throw new NotFoundException("Job application was not found.");

        return MapResponse(jobApplication);
    }

    public async Task<PagedResult<JobApplicationResponse>> GetAllAsync(
        Guid userId,
        GetJobApplicationsRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.PageNumber < 1)
        {
            throw new ValidationException("Page number must be at least 1.");
        }

        if (request.PageSize is < 1 or > MaximumPageSize)
        {
            throw new ValidationException($"Page size must be between 1 and {MaximumPageSize}.");
        }

        if (request.FromDate.HasValue
            && request.ToDate.HasValue
            && request.FromDate.Value > request.ToDate.Value)
        {
            throw new ValidationException("From date cannot be later than to date.");
        }

        if (request.Status.HasValue && !Enum.IsDefined(request.Status.Value))
        {
            throw new ValidationException("Status is not supported.");
        }

        var search = NormalizeOptional(request.Search);
        var platform = NormalizeOptional(request.Platform);

        ValidateMaximumLength(search, 150, "Search");
        ValidateMaximumLength(platform, 50, "Platform");

        var query = new JobApplicationQuery(
            userId,
            search,
            request.Status,
            platform,
            request.FromDate,
            request.ToDate,
            request.PageNumber,
            request.PageSize);

        var (applications, totalCount) = await jobApplicationRepository.GetPagedAsync(
            query,
            cancellationToken);

        var responses = applications
            .Select(MapResponse)
            .ToArray();

        return new PagedResult<JobApplicationResponse>(
            responses,
            request.PageNumber,
            request.PageSize,
            totalCount);
    }

    public async Task<JobApplicationResponse> UpdateStatusAsync(
        Guid id,
        Guid userId,
        UpdateJobApplicationStatusRequest request,
        CancellationToken cancellationToken = default)
    {
        var newStatus = request.NewStatus
            ?? throw new ValidationException("New status is required.");

        if (!Enum.IsDefined(newStatus))
        {
            throw new ValidationException("Status is not supported.");
        }

        var jobApplication = await GetForUpdateAsync(id, userId, cancellationToken);

        JobApplicationStatusWorkflow.ValidateTransition(
            jobApplication.CurrentStatus,
            newStatus,
            request.SkipToOffer);

        await ApplyStatusChangeAsync(jobApplication, newStatus, cancellationToken);

        return MapResponse(jobApplication);
    }

    public async Task<JobApplicationResponse> UnarchiveAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var jobApplication = await GetForUpdateAsync(id, userId, cancellationToken);

        if (jobApplication.CurrentStatus != JobApplicationStatus.Archived)
        {
            throw new ValidationException("Only an archived application can be unarchived.");
        }

        var archiveEntry = await statusHistoryRepository.GetLatestArchiveEntryAsync(
            jobApplication.Id,
            cancellationToken)
            ?? throw new ValidationException(
                "The application cannot be unarchived because its previous status is unavailable.");

        if (archiveEntry.OldStatus == JobApplicationStatus.Archived
            || !Enum.IsDefined(archiveEntry.OldStatus))
        {
            throw new ValidationException(
                "The application cannot be unarchived because its previous status is invalid.");
        }

        await ApplyStatusChangeAsync(
            jobApplication,
            archiveEntry.OldStatus,
            cancellationToken);

        return MapResponse(jobApplication);
    }

    private async Task<JobApplicationEntity> GetForUpdateAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken)
    {
        return await jobApplicationRepository.GetForUpdateAsync(id, userId, cancellationToken)
            ?? throw new NotFoundException("Job application was not found.");
    }

    private async Task ApplyStatusChangeAsync(
        JobApplicationEntity jobApplication,
        JobApplicationStatus newStatus,
        CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var statusHistory = new JobApplicationStatusHistory
        {
            JobApplicationId = jobApplication.Id,
            OldStatus = jobApplication.CurrentStatus,
            NewStatus = newStatus,
            CreatedAtUtc = now,
        };

        jobApplication.CurrentStatus = newStatus;
        jobApplication.UpdatedAtUtc = now;

        await statusHistoryRepository.AddAsync(statusHistory, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
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

    private static void ValidateMaximumLength(string? value, int maximumLength, string fieldName)
    {
        if (value?.Length > maximumLength)
        {
            throw new ValidationException($"{fieldName} cannot exceed {maximumLength} characters.");
        }
    }

    private static JobApplicationResponse MapResponse(JobApplicationEntity application)
    {
        return new JobApplicationResponse(
            application.Id,
            application.CompanyName,
            application.RoleTitle,
            application.Platform,
            application.ApplicationDate,
            application.CurrentStatus,
            application.JobLink,
            application.PortfolioLink,
            application.GitHubLink,
            application.CreatedAtUtc,
            application.UpdatedAtUtc);
    }
}
