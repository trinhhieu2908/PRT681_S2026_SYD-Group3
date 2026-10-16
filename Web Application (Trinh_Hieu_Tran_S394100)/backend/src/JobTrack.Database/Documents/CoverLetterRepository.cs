using JobTrack.Database.Persistence;
using JobTrack.Modules.Documents.Entities;
using JobTrack.Modules.Documents.Repositories;
using Microsoft.EntityFrameworkCore;

namespace JobTrack.Database.Documents;

public sealed class CoverLetterRepository(JobTrackDbContext dbContext)
    : ICoverLetterRepository
{
    public Task AddAsync(
        CoverLetter coverLetter,
        CancellationToken cancellationToken = default)
    {
        return dbContext.CoverLetters.AddAsync(coverLetter, cancellationToken).AsTask();
    }

    public Task<CoverLetter?> GetByJobApplicationIdForUpdateAsync(
        Guid jobApplicationId,
        CancellationToken cancellationToken = default)
    {
        return dbContext.CoverLetters.SingleOrDefaultAsync(
            coverLetter => coverLetter.JobApplicationId == jobApplicationId,
            cancellationToken);
    }
}
