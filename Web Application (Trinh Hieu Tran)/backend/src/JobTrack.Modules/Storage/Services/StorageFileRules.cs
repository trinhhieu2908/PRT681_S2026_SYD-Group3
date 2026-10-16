using System.Security.Cryptography;
using JobTrack.Common.Exceptions;
using JobTrack.Modules.Storage.Enums;

namespace JobTrack.Modules.Storage.Services;

public static class StorageFileRules
{
    private const int MaximumFileNameLength = 255;
    private const int CoverLetterSuffixLength = 10;
    private const string SuffixCharacters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    private static readonly IReadOnlyDictionary<string, string> AllowedContentTypes =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            [".pdf"] = "application/pdf",
            [".doc"] = "application/msword",
            [".docx"] = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        };

    public static string ValidateFileName(string? requestedFileName)
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

    public static string GetContentType(string fileName)
    {
        return AllowedContentTypes[Path.GetExtension(fileName)];
    }

    public static string ValidateContentType(string fileName, string? requestedContentType)
    {
        var expectedContentType = GetContentType(fileName);

        if (!string.Equals(
                expectedContentType,
                requestedContentType?.Trim(),
                StringComparison.OrdinalIgnoreCase))
        {
            throw new ValidationException(
                $"Content type must be '{expectedContentType}' for '{fileName}'.");
        }

        return expectedContentType;
    }

    public static string BuildObjectKey(
        Guid userId,
        StorageContext context,
        string fileName)
    {
        return context switch
        {
            StorageContext.Resume => $"{userId:D}/resume/{fileName}",
            StorageContext.CoverLetter => BuildCoverLetterObjectKey(userId, fileName),
            _ => throw new ValidationException("Storage context is not supported."),
        };
    }

    public static void ValidateObjectKey(
        Guid userId,
        StorageContext context,
        string fileName,
        string? objectKey)
    {
        if (string.IsNullOrWhiteSpace(objectKey))
        {
            throw new ValidationException("Object key is required.");
        }

        if (context == StorageContext.Resume)
        {
            var expectedObjectKey = BuildObjectKey(userId, context, fileName);

            if (!string.Equals(objectKey, expectedObjectKey, StringComparison.Ordinal))
            {
                throw new ValidationException("Resume object key is invalid.");
            }

            return;
        }

        if (context != StorageContext.CoverLetter
            || !IsValidCoverLetterObjectKey(userId, fileName, objectKey))
        {
            throw new ValidationException("Cover letter object key is invalid.");
        }
    }

    private static string BuildCoverLetterObjectKey(Guid userId, string fileName)
    {
        var extension = Path.GetExtension(fileName);
        var nameWithoutExtension = Path.GetFileNameWithoutExtension(fileName);
        var suffix = GenerateRandomSuffix();

        return $"{userId:D}/cover-letter/{nameWithoutExtension}_{suffix}{extension}";
    }

    private static bool IsValidCoverLetterObjectKey(
        Guid userId,
        string fileName,
        string objectKey)
    {
        var folderPrefix = $"{userId:D}/cover-letter/";

        if (!objectKey.StartsWith(folderPrefix, StringComparison.Ordinal))
        {
            return false;
        }

        var storedFileName = objectKey[folderPrefix.Length..];
        var extension = Path.GetExtension(fileName);
        var expectedNamePrefix = $"{Path.GetFileNameWithoutExtension(fileName)}_";

        if (!storedFileName.StartsWith(expectedNamePrefix, StringComparison.Ordinal)
            || !storedFileName.EndsWith(extension, StringComparison.Ordinal))
        {
            return false;
        }

        var suffixLength = storedFileName.Length
            - expectedNamePrefix.Length
            - extension.Length;

        if (suffixLength != CoverLetterSuffixLength)
        {
            return false;
        }

        var suffix = storedFileName.AsSpan(
            expectedNamePrefix.Length,
            CoverLetterSuffixLength);

        return suffix.IndexOfAnyExcept(SuffixCharacters) < 0;
    }

    private static string GenerateRandomSuffix()
    {
        var suffix = new char[CoverLetterSuffixLength];

        for (var index = 0; index < suffix.Length; index++)
        {
            suffix[index] = SuffixCharacters[
                RandomNumberGenerator.GetInt32(SuffixCharacters.Length)];
        }

        return new string(suffix);
    }
}
