namespace JobTrack.Modules.Auth.Contracts;

public sealed record RegisterResponse(
    Guid UserId,
    string Email,
    TokenResponse Tokens);
