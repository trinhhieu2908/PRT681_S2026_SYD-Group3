using JobTrack.Core.Entities;
using JobTrack.Modules.JobApplication.Enums;

namespace JobTrack.Modules.JobApplication.Entities;

public sealed class JobApplicationStatusHistory : BaseEntity
{
    public Guid JobApplicationId { get; set; }
    public JobApplicationStatus OldStatus { get; set; }
    public JobApplicationStatus NewStatus { get; set; }
}
