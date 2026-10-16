namespace JobTrack.Modules.Documents.Contracts;

public sealed record AttachResumeRequest
{
    public Guid ResumeId { get; init; }
}
