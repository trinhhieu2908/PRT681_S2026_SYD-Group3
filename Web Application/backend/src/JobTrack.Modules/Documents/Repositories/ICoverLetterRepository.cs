using JobTrack.Modules.Documents.Entities;

namespace JobTrack.Modules.Documents.Repositories;

public interface ICoverLetterRepository
{
    Task AddAsync(CoverLetter coverLetter, CancellationToken cancellationToken = default);

    Task<CoverLetter?> GetByJobApplicationIdForUpdateAsync(
        Guid jobApplicationId,
        CancellationToken cancellationToken = default);
}
