using JobTrack.Common.Pagination;
using JobTrack.Modules.JobApplication.Contracts;

namespace JobTrack.Modules.JobApplication.Services;

public interface IJobApplicationService
{
    Task<JobApplicationResponse> CreateAsync(
        Guid userId,
        CreateJobApplicationRequest request,
        CancellationToken cancellationToken = default);

    Task<JobApplicationResponse> GetByIdAsync(
        Guid id,
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<PagedResult<JobApplicationResponse>> GetAllAsync(
        Guid userId,
        GetJobApplicationsRequest request,
        CancellationToken cancellationToken = default);
}
