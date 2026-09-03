using System.ComponentModel.DataAnnotations;

namespace JobTrack.Modules.Auth.Contracts;

public sealed record RefreshTokenRequest
{
    [Required]
    public string RefreshToken { get; init; } = string.Empty;
}
