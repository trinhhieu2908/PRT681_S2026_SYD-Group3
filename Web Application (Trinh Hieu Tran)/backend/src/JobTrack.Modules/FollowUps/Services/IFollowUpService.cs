using JobTrack.Modules.FollowUps.Contracts;

namespace JobTrack.Modules.FollowUps.Services;

public interface IFollowUpService
{
    Task<FollowUpResponse> CreateAsync(
        Guid userId,
        Guid jobApplicationId,
        CreateFollowUpRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<FollowUpResponse>> GetAllAsync(
        Guid userId,
        Guid jobApplicationId,
        CancellationToken cancellationToken = default);

    Task<FollowUpResponse> GetByIdAsync(
        Guid userId,
        Guid jobApplicationId,
        Guid followUpId,
        CancellationToken cancellationToken = default);

    Task<FollowUpResponse> UpdateAsync(
        Guid userId,
        Guid jobApplicationId,
        Guid followUpId,
        UpdateFollowUpRequest request,
        CancellationToken cancellationToken = default);

    Task<FollowUpResponse> UpdateCompletionAsync(
        Guid userId,
        Guid jobApplicationId,
        Guid followUpId,
        UpdateFollowUpCompletionRequest request,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        Guid userId,
        Guid jobApplicationId,
        Guid followUpId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<PendingFollowUpResponse>> GetPendingAsync(
        Guid userId,
        CancellationToken cancellationToken = default);
}
