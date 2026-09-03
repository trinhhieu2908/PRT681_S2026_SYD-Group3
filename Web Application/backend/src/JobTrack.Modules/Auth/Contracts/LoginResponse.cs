namespace JobTrack.Modules.Auth.Contracts;

public sealed record LoginResponse(
    Guid UserId,
    string Username,
    TokenResponse Tokens);
