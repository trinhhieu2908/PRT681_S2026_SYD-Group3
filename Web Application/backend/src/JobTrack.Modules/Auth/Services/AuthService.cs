using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using JobTrack.Common.Exceptions;
using JobTrack.Core.UnitOfWork;
using JobTrack.Modules.Auth.Configuration;
using JobTrack.Modules.Auth.Contracts;
using JobTrack.Modules.Users.Entities;
using JobTrack.Modules.Users.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace JobTrack.Modules.Auth.Services;

public sealed class AuthService(
    IUserRepository userRepository,
    IUnitOfWork unitOfWork,
    IPasswordHasher<User> passwordHasher,
    IOptions<JwtOptions> jwtOptions)
    : IAuthService
{
    private readonly JwtOptions _jwtOptions = jwtOptions.Value;

    public async Task<RegisterResponse> RegisterAsync(
        RegisterRequest request,
        CancellationToken cancellationToken = default)
    {
        var username = request.Username?.Trim() ?? string.Empty;
        ValidateRegistration(username, request.Password);

        var normalizedUsername = NormalizeUsername(username);
        var existingUser = await userRepository.GetByNormalizedUsernameAsync(
            normalizedUsername,
            cancellationToken);

        if (existingUser is not null)
        {
            throw new ValidationException("The username is already registered.");
        }

        var user = new User
        {
            Username = username,
            NormalizedUsername = normalizedUsername,
        };
        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);

        await userRepository.AddAsync(user, cancellationToken);
        var tokens = await CreateTokensAsync(user, cancellationToken);

        return new RegisterResponse(user.Id, user.Username, tokens);
    }

    public async Task<LoginResponse> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default)
    {
        var username = request.Username?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(request.Password))
        {
            throw new ValidationException("Username and password are required.");
        }

        var user = await userRepository.GetByNormalizedUsernameAsync(
            NormalizeUsername(username),
            cancellationToken);

        if (user is null)
        {
            throw new UnauthorizedException("Invalid username or password.");
        }

        var verificationResult = passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            request.Password);

        if (verificationResult == PasswordVerificationResult.Failed)
        {
            throw new UnauthorizedException("Invalid username or password.");
        }

        if (verificationResult == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.PasswordHash = passwordHasher.HashPassword(user, request.Password);
        }

        var tokens = await CreateTokensAsync(user, cancellationToken);
        return new LoginResponse(user.Id, user.Username, tokens);
    }

    public async Task<RefreshTokenResponse> RefreshAsync(
        RefreshTokenRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            throw new UnauthorizedException("The refresh token is required.");
        }

        var refreshTokenHash = HashToken(request.RefreshToken);
        var user = await userRepository.GetByRefreshTokenHashAsync(
            refreshTokenHash,
            cancellationToken);

        if (user?.RefreshTokenExpiresAtUtc is null
            || user.RefreshTokenExpiresAtUtc <= DateTime.UtcNow)
        {
            throw new UnauthorizedException("The refresh token is invalid or expired.");
        }

        var tokens = await CreateTokensAsync(user, cancellationToken);
        return new RefreshTokenResponse(tokens);
    }

    public async Task RevokeRefreshTokenAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var user = await userRepository.GetByIdAsync(userId, cancellationToken)
            ?? throw new NotFoundException("User was not found.");

        user.RefreshTokenHash = null;
        user.RefreshTokenCreatedAtUtc = null;
        user.RefreshTokenExpiresAtUtc = null;
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private async Task<TokenResponse> CreateTokensAsync(
        User user,
        CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var accessTokenExpiresAtUtc = now.AddMinutes(_jwtOptions.AccessTokenMinutes);
        var refreshTokenExpiresAtUtc = now.AddDays(_jwtOptions.RefreshTokenDays);
        var refreshToken = GenerateRefreshToken();

        user.RefreshTokenHash = HashToken(refreshToken);
        user.RefreshTokenCreatedAtUtc = now;
        user.RefreshTokenExpiresAtUtc = refreshTokenExpiresAtUtc;

        var accessToken = CreateAccessToken(user, now, accessTokenExpiresAtUtc);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return new TokenResponse(
            accessToken,
            accessTokenExpiresAtUtc,
            refreshToken,
            refreshTokenExpiresAtUtc);
    }

    private string CreateAccessToken(User user, DateTime issuedAtUtc, DateTime expiresAtUtc)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtOptions.Key));
        var signingCredentials = new SigningCredentials(
            signingKey,
            SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: _jwtOptions.Issuer,
            audience: _jwtOptions.Audience,
            claims: claims,
            notBefore: issuedAtUtc,
            expires: expiresAtUtc,
            signingCredentials: signingCredentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static void ValidateRegistration(string username, string password)
    {
        if (username.Length is < 3 or > 50)
        {
            throw new ValidationException("Username must be between 3 and 50 characters.");
        }

        if (string.IsNullOrWhiteSpace(password) || password.Length is < 8 or > 128)
        {
            throw new ValidationException("Password must be between 8 and 128 characters.");
        }
    }

    private static string NormalizeUsername(string username)
    {
        return username.ToUpperInvariant();
    }

    private static string GenerateRefreshToken()
    {
        return Convert.ToBase64String(RandomNumberGenerator.GetBytes(64))
            .Replace("+", "-")
            .Replace("/", "_")
            .TrimEnd('=');
    }

    private static string HashToken(string token)
    {
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
    }
}
