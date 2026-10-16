using JobTrack.Modules.JobApplication.Enums;

namespace JobTrack.Modules.JobApplication.Contracts;

public sealed record JobApplicationResponse(
    Guid Id,
    string CompanyName,
    string RoleTitle,
    string Platform,
    DateOnly ApplicationDate,
    JobApplicationStatus CurrentStatus,
    string? JobLink,
    string? PortfolioLink,
    string? GitHubLink,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc);
