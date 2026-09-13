using JobTrack.Database.Persistence;
using JobTrack.Modules.Documents.Entities;
using JobTrack.Modules.Documents.Repositories;
using Microsoft.EntityFrameworkCore;

namespace JobTrack.Database.Documents;

public sealed class ResumeRepository(JobTrackDbContext dbContext) : IResumeRepository
{
    public Task AddAsync(Resume resume, CancellationToken cancellationToken = default)
    {
        return dbContext.Resumes.AddAsync(resume, cancellationToken).AsTask();
    }

    public async Task<IReadOnlyList<Resume>> GetAllByUserIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.Resumes
            .AsNoTracking()
            .Where(resume => resume.UserId == userId)
            .OrderByDescending(resume => resume.CreatedAtUtc)
            .ThenByDescending(resume => resume.Id)
            .ToListAsync(cancellationToken);
    }

    public Task<bool> ExistsByFileNameAsync(
        Guid userId,
        string fileName,
        CancellationToken cancellationToken = default)
    {
        return dbContext.Resumes.AnyAsync(
            resume => resume.UserId == userId && resume.FileName == fileName,
            cancellationToken);
    }

    public async Task<IReadOnlyList<string>> GetExistingFileNamesAsync(
        Guid userId,
        IReadOnlyCollection<string> fileNames,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.Resumes
            .AsNoTracking()
            .Where(resume =>
                resume.UserId == userId
                && fileNames.Contains(resume.FileName))
            .Select(resume => resume.FileName)
            .ToListAsync(cancellationToken);
    }
}
