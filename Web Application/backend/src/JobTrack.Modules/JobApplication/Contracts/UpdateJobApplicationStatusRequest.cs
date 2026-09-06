using System.ComponentModel.DataAnnotations;
using JobTrack.Modules.JobApplication.Enums;

namespace JobTrack.Modules.JobApplication.Contracts;

public sealed record UpdateJobApplicationStatusRequest
{
    [Required]
    public JobApplicationStatus? NewStatus { get; init; }

    public bool SkipToOffer { get; init; }
}
