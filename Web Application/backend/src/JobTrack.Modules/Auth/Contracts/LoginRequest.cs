using System.ComponentModel.DataAnnotations;

namespace JobTrack.Modules.Auth.Contracts;

public sealed record LoginRequest
{
    [Required]
    public string Username { get; init; } = string.Empty;

    [Required]
    public string Password { get; init; } = string.Empty;
}
