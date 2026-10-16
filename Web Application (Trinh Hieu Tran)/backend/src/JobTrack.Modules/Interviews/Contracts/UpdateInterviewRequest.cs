using System.ComponentModel.DataAnnotations;

namespace JobTrack.Modules.Interviews.Contracts;

public sealed record UpdateInterviewRequest
{
    [MaxLength(150)]
    public string? Title { get; init; }

    [MaxLength(100)]
    public string? InterviewType { get; init; }

    public DateTimeOffset? ScheduledAtUtc { get; init; }

    [MaxLength(250)]
    public string? Location { get; init; }

    [Url]
    [MaxLength(2048)]
    public string? MeetingLink { get; init; }

    [MaxLength(150)]
    public string? ContactName { get; init; }

    [EmailAddress]
    [MaxLength(320)]
    public string? ContactEmail { get; init; }

    [MaxLength(50)]
    public string? ContactPhone { get; init; }

    [MaxLength(4000)]
    public string? Notes { get; init; }
}
