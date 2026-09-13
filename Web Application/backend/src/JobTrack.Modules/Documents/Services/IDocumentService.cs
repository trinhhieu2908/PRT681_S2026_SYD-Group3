using JobTrack.Modules.Documents.Contracts;

namespace JobTrack.Modules.Documents.Services;

public interface IDocumentService
{
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
