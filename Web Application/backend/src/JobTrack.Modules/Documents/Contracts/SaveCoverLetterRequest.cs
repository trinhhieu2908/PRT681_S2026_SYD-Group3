using System.ComponentModel.DataAnnotations;

namespace JobTrack.Modules.Documents.Contracts;

public sealed record SaveCoverLetterRequest
{
    [Required]
    [MaxLength(255)]
    public string FileName { get; init; } = string.Empty;

    [Required]
    [MaxLength(1024)]
    public string ObjectKey { get; init; } = string.Empty;

    [Required]
    [MaxLength(127)]
    public string ContentType { get; init; } = string.Empty;
}
