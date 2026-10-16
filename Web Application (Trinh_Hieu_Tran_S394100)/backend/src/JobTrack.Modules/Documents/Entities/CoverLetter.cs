using JobTrack.Core.Entities;

namespace JobTrack.Modules.Documents.Entities;

public sealed class CoverLetter : BaseEntity
{
    public Guid UserId { get; set; }

    public Guid JobApplicationId { get; set; }

    public string FileName { get; set; } = string.Empty;

    public string ObjectKey { get; set; } = string.Empty;

    public string ContentType { get; set; } = string.Empty;
}
