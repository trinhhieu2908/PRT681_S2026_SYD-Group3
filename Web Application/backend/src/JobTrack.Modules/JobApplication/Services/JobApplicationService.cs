using JobTrack.Common.Exceptions;
using JobTrack.Common.Pagination;
using JobTrack.Core.UnitOfWork;
using JobTrack.Modules.JobApplication.Contracts;
using JobTrack.Modules.JobApplication.Enums;
using JobTrack.Modules.JobApplication.Repositories;
using JobApplicationEntity = JobTrack.Modules.JobApplication.Entities.JobApplication;

namespace JobTrack.Modules.JobApplication.Services;

public sealed class JobApplicationService(
    IJobApplicationRepository jobApplicationRepository,
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
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        if (pageNumber < 1)
        {
            throw new ValidationException("Page number must be at least 1.");
        }

        if (pageSize is < 1 or > MaximumPageSize)
        {
            throw new ValidationException($"Page size must be between 1 and {MaximumPageSize}.");
        }

        var (applications, totalCount) = await jobApplicationRepository.GetPagedByUserIdAsync(
            userId,
            pageNumber,
            pageSize,
            cancellationToken);

        var responses = applications
            .Select(MapResponse)
            .ToArray();

        return new PagedResult<JobApplicationResponse>(
            responses,
            pageNumber,
            pageSize,
            totalCount);
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
