using Amazon.S3;
using Amazon.S3.Model;
using JobTrack.Common.Exceptions;
using JobTrack.Modules.Storage.Configuration;
using JobTrack.Modules.Storage.Contracts;
using JobTrack.Modules.Storage.Enums;
using Microsoft.Extensions.Options;

namespace JobTrack.Modules.Storage.Services;

public sealed class S3StorageService(
    IAmazonS3 s3Client,
    IOptions<S3StorageOptions> options)
    : IStorageService
{
    private const int MaximumFilesPerRequest = 10;
    private const int MaximumFileNameLength = 255;

    private static readonly IReadOnlyDictionary<string, string> AllowedContentTypes =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            [".pdf"] = "application/pdf",
            [".doc"] = "application/msword",
            [".docx"] = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        };

    private readonly S3StorageOptions _options = options.Value;

    public async Task<GenerateUploadPresignedUrlsResponse> GenerateUploadPresignedUrlsAsync(
        Guid userId,
        GenerateUploadPresignedUrlsRequest request,
        CancellationToken cancellationToken = default)
    {
        if (!request.Context.HasValue || !Enum.IsDefined(request.Context.Value))
        {
            throw new ValidationException("Storage context must be resume or cover-letter.");
        }

        if (request.FileNames is null
            || request.FileNames.Count is < 1 or > MaximumFilesPerRequest)
        {
            throw new ValidationException(
                $"File names must contain between 1 and {MaximumFilesPerRequest} items.");
        }

        var expiresAtUtc = DateTime.UtcNow.AddMinutes(_options.UploadUrlExpiryMinutes);
        var uploads = new List<UploadPresignedUrlResponse>(request.FileNames.Count);

        foreach (var requestedFileName in request.FileNames)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var fileName = ValidateFileName(requestedFileName);
            var contentType = AllowedContentTypes[Path.GetExtension(fileName)];
            var objectKey = BuildObjectKey(userId, request.Context.Value, fileName);
            var uploadUrl = await s3Client.GetPreSignedURLAsync(new GetPreSignedUrlRequest
            {
                BucketName = _options.BucketName,
                Key = objectKey,
                Verb = HttpVerb.PUT,
                ContentType = contentType,
                Expires = expiresAtUtc,
                Protocol = Protocol.HTTPS,
            });

            uploads.Add(new UploadPresignedUrlResponse(
                fileName,
                objectKey,
                uploadUrl,
                "PUT",
                contentType,
                expiresAtUtc));
        }

        return new GenerateUploadPresignedUrlsResponse(uploads);
    }

    private static string ValidateFileName(string? requestedFileName)
    {
        var fileName = requestedFileName?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(fileName))
        {
            throw new ValidationException("File name cannot be empty.");
        }

        if (fileName.Length > MaximumFileNameLength)
        {
            throw new ValidationException(
                $"File name cannot exceed {MaximumFileNameLength} characters.");
        }

        if (fileName.Contains('/')
            || fileName.Contains('\\')
            || fileName.Any(char.IsControl))
        {
            throw new ValidationException("File name contains invalid characters.");
        }

        if (!AllowedContentTypes.ContainsKey(Path.GetExtension(fileName)))
        {
            throw new ValidationException("Only PDF, DOC, and DOCX files are supported.");
        }

        return fileName;
    }

    private static string BuildObjectKey(
        Guid userId,
        StorageContext context,
        string fileName)
    {
        var contextFolder = context switch
        {
            StorageContext.Resume => "resume",
            StorageContext.CoverLetter => "cover-letter",
            _ => throw new ValidationException("Storage context is not supported."),
        };

        return $"{userId:D}/{contextFolder}/{Guid.NewGuid():N}-{fileName}";
    }
}
