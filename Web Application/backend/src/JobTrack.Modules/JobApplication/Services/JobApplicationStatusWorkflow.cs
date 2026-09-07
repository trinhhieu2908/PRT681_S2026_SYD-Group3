using JobTrack.Common.Exceptions;
using JobTrack.Modules.JobApplication.Enums;

namespace JobTrack.Modules.JobApplication.Services;

public static class JobApplicationStatusWorkflow
{
    private static readonly IReadOnlyDictionary<JobApplicationStatus, HashSet<JobApplicationStatus>>
        AllowedTransitions = new Dictionary<JobApplicationStatus, HashSet<JobApplicationStatus>>
        {
            [JobApplicationStatus.Applied] =
            [
                JobApplicationStatus.Interview,
                JobApplicationStatus.Rejected,
                JobApplicationStatus.Withdrawn,
            ],
            [JobApplicationStatus.Interview] =
            [
                JobApplicationStatus.Offer,
                JobApplicationStatus.Rejected,
                JobApplicationStatus.Withdrawn,
            ],
            [JobApplicationStatus.Offer] =
            [
                JobApplicationStatus.Withdrawn,
                JobApplicationStatus.Archived,
            ],
            [JobApplicationStatus.Rejected] = [JobApplicationStatus.Archived],
            [JobApplicationStatus.Withdrawn] = [JobApplicationStatus.Archived],
            [JobApplicationStatus.Archived] = [],
        };

    public static void ValidateTransition(
        JobApplicationStatus currentStatus,
        JobApplicationStatus newStatus,
        bool skipToOffer)
    {
        if (!Enum.IsDefined(currentStatus) || !Enum.IsDefined(newStatus))
        {
            throw new ValidationException("Status is not supported.");
        }

        if (currentStatus == newStatus)
        {
            throw new ValidationException($"The application is already in {currentStatus} status.");
        }

        if (currentStatus == JobApplicationStatus.Archived)
        {
            throw new ValidationException(
                "An archived application can only be restored using the unarchive action.");
        }

        if (skipToOffer)
        {
            if (currentStatus == JobApplicationStatus.Applied
                && newStatus == JobApplicationStatus.Offer)
            {
                return;
            }

            throw new ValidationException(
                "The skip-to-offer override is only valid for an Applied to Offer transition.");
        }

        if (currentStatus == JobApplicationStatus.Applied
            && newStatus == JobApplicationStatus.Offer)
        {
            throw new ValidationException(
                "Applied to Offer requires the explicit skip-to-offer override.");
        }

        if (!AllowedTransitions[currentStatus].Contains(newStatus))
        {
            throw new ValidationException(
                $"A status transition from {currentStatus} to {newStatus} is not allowed.");
        }
    }
}
