using System.ComponentModel.DataAnnotations;

namespace JobTrack.Modules.FollowUps.Contracts;

public sealed record CreateFollowUpRequest
{
    [Required]
    [MaxLength(150)]
    public string Title { get; init; } = string.Empty;

    [Required]
    public DateOnly? DueDate { get; init; }

    [MaxLength(4000)]
    public string? Notes { get; init; }
}
