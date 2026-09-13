using JobTrack.Modules.Documents.Contracts;

namespace JobTrack.Modules.Documents.Services;

public interface IDocumentService
{
    Task<IReadOnlyList<ResumeResponse>> GetResumesAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<ResumeResponse> SaveResumeAsync(
        Guid userId,
        SaveResumeRequest request,
        CancellationToken cancellationToken = default);

    Task<CoverLetterResponse> SaveCoverLetterAsync(
        Guid userId,
        Guid jobApplicationId,
        SaveCoverLetterRequest request,
        CancellationToken cancellationToken = default);
}
