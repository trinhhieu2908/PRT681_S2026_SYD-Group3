using JobTrack.Modules.Interviews.Entities;

namespace JobTrack.Modules.Interviews.Repositories;

public interface IInterviewRepository
{
    Task AddAsync(
        Interview interview,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Interview>> GetAllByJobApplicationAsync(
        Guid jobApplicationId,
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<Interview?> GetByIdAsync(
        Guid id,
        Guid jobApplicationId,
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<Interview?> GetForUpdateAsync(
        Guid id,
        Guid jobApplicationId,
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Interview>> GetUpcomingAsync(
        Guid userId,
        DateTime fromUtc,
        DateTime toUtc,
        CancellationToken cancellationToken = default);

    void Remove(Interview interview);
}
