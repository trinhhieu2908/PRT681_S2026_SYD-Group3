using JobTrack.Modules.JobApplication.Enums;

namespace JobTrack.Modules.JobApplication.Repositories;

public sealed record JobApplicationQuery(
    Guid UserId,
    string? Search,
    JobApplicationStatus? Status,
    string? Platform,
    DateOnly? FromDate,
    DateOnly? ToDate,
    int PageNumber,
    int PageSize);
