using System.ComponentModel.DataAnnotations;

namespace JobTrack.Modules.Auth.Contracts;

public sealed record RegisterRequest
{
    [Required]
    [EmailAddress]
    [MaxLength(254)]
    public string Email { get; init; } = string.Empty;

    [Required]
    [StringLength(128, MinimumLength = 8)]
    public string Password { get; init; } = string.Empty;
}
