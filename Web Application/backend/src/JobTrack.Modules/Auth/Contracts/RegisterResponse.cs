namespace JobTrack.Modules.Auth.Contracts;

public sealed record RegisterResponse(
    Guid UserId,
    string Username,
    TokenResponse Tokens);
