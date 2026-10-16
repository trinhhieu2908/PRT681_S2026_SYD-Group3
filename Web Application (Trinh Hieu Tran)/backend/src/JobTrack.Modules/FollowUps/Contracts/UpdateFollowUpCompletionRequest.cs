using System.ComponentModel.DataAnnotations;

namespace JobTrack.Modules.FollowUps.Contracts;

public sealed record UpdateFollowUpCompletionRequest
{
    [Required]
    public bool? IsCompleted { get; init; }
}
