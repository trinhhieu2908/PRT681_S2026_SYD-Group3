using JobTrack.Modules.FollowUps.Entities;

namespace JobTrack.Modules.FollowUps.Repositories;

public interface IFollowUpRepository
{
    Task AddAsync(
        FollowUp followUp,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<FollowUp>> GetAllByJobApplicationAsync(
        Guid jobApplicationId,
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<FollowUp?> GetByIdAsync(
        Guid id,
        Guid jobApplicationId,
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<FollowUp?> GetForUpdateAsync(
        Guid id,
        Guid jobApplicationId,
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<FollowUp>> GetPendingAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    void Remove(FollowUp followUp);
}
