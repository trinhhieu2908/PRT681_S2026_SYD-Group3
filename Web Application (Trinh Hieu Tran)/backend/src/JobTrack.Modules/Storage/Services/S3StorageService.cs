using Amazon.S3;
using Amazon.S3.Model;
using JobTrack.Common.Exceptions;
using JobTrack.Modules.Documents.Repositories;
using JobTrack.Modules.Storage.Configuration;
using JobTrack.Modules.Storage.Contracts;
using JobTrack.Modules.Storage.Enums;
using Microsoft.Extensions.Options;

namespace JobTrack.Modules.Storage.Services;

public sealed class S3StorageService(
    IAmazonS3 s3Client,
    IResumeRepository resumeRepository,
    IOptions<S3StorageOptions> options)
    : IStorageService
{
    private const int MaximumFilesPerRequest = 10;
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

        var files = request.FileNames
            .Select(fileName => StorageFileRules.ValidateFileName(fileName))
            .ToArray();

        if (request.Context.Value == StorageContext.Resume)
        {
            await ValidateResumeFileNamesAsync(userId, files, cancellationToken);
        }

        var expiresAtUtc = DateTime.UtcNow.AddMinutes(_options.UploadUrlExpiryMinutes);
        var uploads = new List<UploadPresignedUrlResponse>(files.Length);

        foreach (var fileName in files)
        {
            cancellationToken.ThrowIfCancellationRequested();

            var contentType = StorageFileRules.GetContentType(fileName);
            var objectKey = StorageFileRules.BuildObjectKey(
                userId,
                request.Context.Value,
                fileName);
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

    public async Task<string> GetPresignedUrlAsync(
        string objectKey,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(objectKey))
        {
            throw new ValidationException("Storage object key is required.");
        }

        cancellationToken.ThrowIfCancellationRequested();

        return await s3Client.GetPreSignedURLAsync(new GetPreSignedUrlRequest
        {
            BucketName = _options.BucketName,
            Key = objectKey,
            Verb = HttpVerb.GET,
            Expires = DateTime.UtcNow.AddMinutes(_options.DownloadUrlExpiryMinutes),
            Protocol = Protocol.HTTPS,
        });
    }

    private async Task ValidateResumeFileNamesAsync(
        Guid userId,
        IReadOnlyCollection<string> fileNames,
        CancellationToken cancellationToken)
    {
        var uniqueFileNames = new HashSet<string>(StringComparer.Ordinal);
        foreach (var fileName in fileNames)
        {
            if (!uniqueFileNames.Add(fileName))
            {
                throw CreateResumeConflict(fileName);
            }
        }

        var existingFileNames = await resumeRepository.GetExistingFileNamesAsync(
            userId,
            fileNames,
            cancellationToken);
        var existingFileNameSet = existingFileNames.ToHashSet(StringComparer.Ordinal);
        var firstConflict = fileNames.FirstOrDefault(existingFileNameSet.Contains);

        if (firstConflict is not null)
        {
            throw CreateResumeConflict(firstConflict);
        }
    }

    private static ConflictException CreateResumeConflict(string fileName)
    {
        return new ConflictException(
            $"A resume version named '{fileName}' already exists. "
            + "Change the filename or select the existing version.");
    }
}
