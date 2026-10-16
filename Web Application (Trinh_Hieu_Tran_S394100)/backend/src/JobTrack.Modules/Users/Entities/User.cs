using JobTrack.Core.Entities;

namespace JobTrack.Modules.Users.Entities;

public sealed class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;

    public string NormalizedEmail { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string? RefreshTokenHash { get; set; }

    public DateTime? RefreshTokenCreatedAtUtc { get; set; }

    public DateTime? RefreshTokenExpiresAtUtc { get; set; }
}
