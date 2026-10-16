using System.ComponentModel.DataAnnotations;
using JobTrack.Modules.JobApplication.Enums;

namespace JobTrack.Modules.JobApplication.Contracts;

public sealed record GetJobApplicationsRequest
{
    [MaxLength(150)]
    public string? Search { get; init; }

    public JobApplicationStatus? Status { get; init; }

    [MaxLength(50)]
    public string? Platform { get; init; }

    public DateOnly? FromDate { get; init; }

    public DateOnly? ToDate { get; init; }

    [Range(1, int.MaxValue)]
    public int PageNumber { get; init; } = 1;

    [Range(1, 100)]
    public int PageSize { get; init; } = 20;
}
