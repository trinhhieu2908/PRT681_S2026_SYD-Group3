namespace JobTrack.Modules.Auth.Configuration;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "JobTrack.Api";

    public string Audience { get; set; } = "JobTrack.Client";

    public string Key { get; set; } = string.Empty;

    public int AccessTokenMinutes { get; set; } = 15;

    public int RefreshTokenDays { get; set; } = 180;
}
