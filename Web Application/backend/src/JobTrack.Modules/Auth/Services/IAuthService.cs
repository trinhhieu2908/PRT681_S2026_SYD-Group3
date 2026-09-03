using JobTrack.Modules.Auth.Contracts;

namespace JobTrack.Modules.Auth.Services;

public interface IAuthService
{
    Task<RegisterResponse> RegisterAsync(
        RegisterRequest request,
        CancellationToken cancellationToken = default);

    Task<LoginResponse> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default);

    Task<RefreshTokenResponse> RefreshAsync(
        RefreshTokenRequest request,
        CancellationToken cancellationToken = default);

    Task RevokeRefreshTokenAsync(
        Guid userId,
        CancellationToken cancellationToken = default);
}
