using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using JobTrack.Core.UnitOfWork;
using JobTrack.Database.JobApplication;
using JobTrack.Database.Users;
using JobTrack.Database.Persistence;
using JobTrack.Database.Repositories;
using JobTrack.Modules.Auth.Configuration;
using JobTrack.Modules.Auth.Services;
using JobTrack.Modules.JobApplication.Services;
using JobTrack.Modules.Storage.Configuration;
using JobTrack.Modules.Storage.Services;
using JobTrack.Modules.Users.Entities;
using JobTrack.Modules.Users.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

namespace JobTrack.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public const string FrontendCorsPolicy = "FrontendCors";

    public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(
                    new JsonStringEnumConverter(allowIntegerValues: false));
            });
        services.AddCors(options =>
        {
            options.AddPolicy(FrontendCorsPolicy, policy =>
            {
                var allowedOrigins = configuration
                    .GetSection("Cors:AllowedOrigins")
                    .Get<string[]>() ?? [];

                policy
                    .WithOrigins(allowedOrigins)
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });
        });
        services.AddOpenApi();
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Enter a valid JWT access token.",
            });

            options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecuritySchemeReference("Bearer", document),
                    new List<string>()
                },
            });
        });

        services.AddDatabase(configuration);
        services.AddAuthentication(configuration);
        services.AddStorage(configuration);
        services.AddAuthorization();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IJobApplicationService, JobApplicationService>();

        return services;
    }

    private static IServiceCollection AddStorage(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddOptions<S3StorageOptions>()
            .Bind(configuration.GetSection(S3StorageOptions.SectionName))
            .Validate(options => !string.IsNullOrWhiteSpace(options.AccessKey),
                "S3:AccessKey is required.")
            .Validate(options => !string.IsNullOrWhiteSpace(options.SecretKey),
                "S3:SecretKey is required.")
            .Validate(options => !string.IsNullOrWhiteSpace(options.BucketName),
                "S3:BucketName is required.")
            .Validate(options => !string.IsNullOrWhiteSpace(options.Region),
                "S3:Region is required.")
            .Validate(options => options.UploadUrlExpiryMinutes is >= 1 and <= 60,
                "S3:UploadUrlExpiryMinutes must be between 1 and 60.")
            .ValidateOnStart();

        services.AddSingleton<IAmazonS3>(serviceProvider =>
        {
            var options = serviceProvider
                .GetRequiredService<IOptions<S3StorageOptions>>()
                .Value;
            var credentials = new BasicAWSCredentials(options.AccessKey, options.SecretKey);
            var region = RegionEndpoint.GetBySystemName(options.Region);

            return new AmazonS3Client(credentials, region);
        });

        services.AddScoped<IStorageService, S3StorageService>();

        return services;
    }

    private static IServiceCollection AddAuthentication(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddOptions<JwtOptions>()
            .Bind(configuration.GetSection(JwtOptions.SectionName))
            .Validate(options => !string.IsNullOrWhiteSpace(options.Issuer), "Jwt:Issuer is required.")
            .Validate(options => !string.IsNullOrWhiteSpace(options.Audience), "Jwt:Audience is required.")
            .Validate(options => !string.IsNullOrWhiteSpace(options.Key) && options.Key.Length >= 32,
                "Jwt:Key must be at least 32 characters long.")
            .Validate(options => options.AccessTokenMinutes > 0, "Jwt:AccessTokenMinutes must be positive.")
            .Validate(options => options.RefreshTokenDays > 0, "Jwt:RefreshTokenDays must be positive.")
            .ValidateOnStart();

        var jwtOptions = new JwtOptions();
        configuration.GetSection(JwtOptions.SectionName).Bind(jwtOptions);

        services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = jwtOptions.Issuer,
                    ValidateAudience = true,
                    ValidAudience = jwtOptions.Audience,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtOptions.Key)),
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromSeconds(30),
                    NameClaimType = ClaimTypes.Name,
                    RoleClaimType = ClaimTypes.Role,
                };
            });

        return services;
    }

    private static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? "Host=localhost;Port=5432;Database=job_track;Username=dylan;Password=dylan";

        services.AddDbContext<JobTrackDbContext>(options =>
        {
            options.UseNpgsql(connectionString);
        });

        services.AddScoped<IUnitOfWork>(serviceProvider =>
            serviceProvider.GetRequiredService<JobTrackDbContext>());

        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<JobTrack.Modules.Users.Repositories.IUserRepository, UserRepository>();
        services.AddScoped<JobTrack.Modules.JobApplication.Repositories.IJobApplicationRepository,
            JobApplicationRepository>();
        services.AddScoped<
            JobTrack.Modules.JobApplication.Repositories.IJobApplicationStatusHistoryRepository,
            JobApplicationStatusHistoryRepository>();
        services.AddSingleton<IPasswordHasher<User>, PasswordHasher<User>>();

        return services;
    }
}
