using JobTrack.Modules.Documents.Contracts;
using JobTrack.Modules.JobApplication.Enums;

namespace JobTrack.Modules.JobApplication.Contracts;

public sealed record JobApplicationDetailResponse(
    Guid Id,
    string CompanyName,
    string RoleTitle,
    string Platform,
    DateOnly ApplicationDate,
    JobApplicationStatus CurrentStatus,
    string? JobLink,
    string? PortfolioLink,
    string? GitHubLink,
    ResumeResponse? Resume,
    CoverLetterResponse? CoverLetter,
    DateTime CreatedAtUtc,
    DateTime? UpdatedAtUtc);
