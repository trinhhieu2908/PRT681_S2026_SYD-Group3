using System.ComponentModel.DataAnnotations;
using JobTrack.Modules.Storage.Enums;

namespace JobTrack.Modules.Storage.Contracts;

public sealed record GenerateUploadPresignedUrlsRequest
{
    [Required]
    public StorageContext? Context { get; init; }

    [Required]
    public IReadOnlyList<string> FileNames { get; init; } = [];
}
