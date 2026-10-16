using JobTrack.Modules.Interviews.Contracts;

namespace JobTrack.Modules.Interviews.Services;

public interface IInterviewService
{
    Task<InterviewResponse> CreateAsync(
        Guid userId,
        Guid jobApplicationId,
        CreateInterviewRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<InterviewResponse>> GetAllAsync(
        Guid userId,
        Guid jobApplicationId,
        CancellationToken cancellationToken = default);

    Task<InterviewResponse> GetByIdAsync(
        Guid userId,
        Guid jobApplicationId,
        Guid interviewId,
        CancellationToken cancellationToken = default);

    Task<InterviewResponse> UpdateAsync(
        Guid userId,
        Guid jobApplicationId,
        Guid interviewId,
        UpdateInterviewRequest request,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        Guid userId,
        Guid jobApplicationId,
        Guid interviewId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<UpcomingInterviewResponse>> GetUpcomingAsync(
        Guid userId,
        int days,
        CancellationToken cancellationToken = default);
}
