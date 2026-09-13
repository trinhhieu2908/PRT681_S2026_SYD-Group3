using JobTrack.Modules.Documents.Entities;

namespace JobTrack.Modules.Documents.Repositories;

public interface IResumeRepository
{
    Task AddAsync(Resume resume, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Resume>> GetAllByUserIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<bool> ExistsByFileNameAsync(
        Guid userId,
        string fileName,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<string>> GetExistingFileNamesAsync(
        Guid userId,
        IReadOnlyCollection<string> fileNames,
        CancellationToken cancellationToken = default);
}
