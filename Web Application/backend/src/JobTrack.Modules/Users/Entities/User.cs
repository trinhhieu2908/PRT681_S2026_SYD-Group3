using JobTrack.Core.Entities;

namespace JobTrack.Modules.Users.Entities;

public sealed class User : BaseEntity
{
    public string Username { get; set; } = string.Empty;

    public string NormalizedUsername { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string? RefreshTokenHash { get; set; }

    public DateTime? RefreshTokenCreatedAtUtc { get; set; }

    public DateTime? RefreshTokenExpiresAtUtc { get; set; }
}
