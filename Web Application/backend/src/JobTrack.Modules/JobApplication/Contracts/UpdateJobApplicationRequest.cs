using System.ComponentModel.DataAnnotations;

namespace JobTrack.Modules.JobApplication.Contracts;

public sealed record UpdateJobApplicationRequest
{
    [MaxLength(150)]
    public string? CompanyName { get; init; }

    [MaxLength(150)]
    public string? RoleTitle { get; init; }

    [MaxLength(50)]
    public string? Platform { get; init; }

    public DateOnly? ApplicationDate { get; init; }

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
