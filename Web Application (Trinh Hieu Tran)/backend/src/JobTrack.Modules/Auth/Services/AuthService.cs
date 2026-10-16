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
using EmailAddressAttribute = System.ComponentModel.DataAnnotations.EmailAddressAttribute;

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
        var email = request.Email?.Trim() ?? string.Empty;
        ValidateRegistration(email, request.Password);

        var normalizedEmail = NormalizeEmail(email);
        var existingUser = await userRepository.GetByNormalizedEmailAsync(
            normalizedEmail,
            cancellationToken);

        if (existingUser is not null)
        {
            throw new ValidationException("The email address is already registered.");
        }

        var user = new User
        {
            Email = email,
            NormalizedEmail = normalizedEmail,
        };
        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);

        await userRepository.AddAsync(user, cancellationToken);
        var tokens = await CreateTokensAsync(user, cancellationToken);

        return new RegisterResponse(user.Id, user.Email, tokens);
    }

    public async Task<LoginResponse> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default)
    {
        var email = request.Email?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(request.Password))
        {
            throw new ValidationException("Email and password are required.");
        }

        ValidateEmail(email);

        var user = await userRepository.GetByNormalizedEmailAsync(
            NormalizeEmail(email),
            cancellationToken);

        if (user is null)
        {
            throw new UnauthorizedException("Invalid email or password.");
        }

        var verificationResult = passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            request.Password);

        if (verificationResult == PasswordVerificationResult.Failed)
        {
            throw new UnauthorizedException("Invalid email or password.");
        }

        if (verificationResult == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.PasswordHash = passwordHasher.HashPassword(user, request.Password);
        }

        var tokens = await CreateTokensAsync(user, cancellationToken);
        return new LoginResponse(user.Id, user.Email, tokens);
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
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Email),
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

    private static void ValidateRegistration(string email, string password)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            throw new ValidationException("Email is required.");
        }

        ValidateEmail(email);

        if (string.IsNullOrWhiteSpace(password))
        {
            throw new ValidationException("Password is required.");
        }

        if (password.Length < 8)
        {
            throw new ValidationException("Password must be at least 8 characters long.");
        }

        if (password.Length > 128)
        {
            throw new ValidationException("Password cannot exceed 128 characters.");
        }

        if (!password.Any(char.IsUpper))
        {
            throw new ValidationException("Password must contain at least one uppercase letter.");
        }

        if (!password.Any(char.IsLower))
        {
            throw new ValidationException("Password must contain at least one lowercase letter.");
        }

        if (!password.Any(char.IsDigit))
        {
            throw new ValidationException("Password must contain at least one number.");
        }

        if (!password.Any(character => char.IsPunctuation(character) || char.IsSymbol(character)))
        {
            throw new ValidationException("Password must contain at least one special character.");
        }
    }

    private static void ValidateEmail(string email)
    {
        if (email.Length > 254 || !new EmailAddressAttribute().IsValid(email))
        {
            throw new ValidationException("Enter a valid email address.");
        }
    }

    private static string NormalizeEmail(string email)
    {
        return email.ToUpperInvariant();
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
