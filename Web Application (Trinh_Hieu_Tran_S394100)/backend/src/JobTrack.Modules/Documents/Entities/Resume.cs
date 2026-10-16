using JobTrack.Core.Entities;

namespace JobTrack.Modules.Documents.Entities;

public sealed class Resume : BaseEntity
{
    public Guid UserId { get; set; }

    public string FileName { get; set; } = string.Empty;

    public string ObjectKey { get; set; } = string.Empty;

    public string ContentType { get; set; } = string.Empty;
}
