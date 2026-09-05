using System.ComponentModel.DataAnnotations;

namespace JobTrack.Modules.JobApplication.Contracts;

public sealed record CreateJobApplicationRequest
{
    [Required]
    [MaxLength(150)]
    public string CompanyName { get; init; } = string.Empty;

    [Required]
    [MaxLength(150)]
    public string RoleTitle { get; init; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Platform { get; init; } = string.Empty;

    [Url]
    [MaxLength(2048)]
    public string? JobLink { get; init; }

    [Url]
    [MaxLength(2048)]
    public string? PortfolioLink { get; init; }

    [Url]
    [MaxLength(2048)]
    public string? GitHubLink { get; init; }
}
