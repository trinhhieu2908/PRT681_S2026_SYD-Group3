using JobTrack.Modules.JobApplication.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using JobApplicationEntity = JobTrack.Modules.JobApplication.Entities.JobApplication;

namespace JobTrack.Database.JobApplication;

public sealed class JobApplicationStatusHistoryConfiguration
    : IEntityTypeConfiguration<JobApplicationStatusHistory>
{
    public void Configure(EntityTypeBuilder<JobApplicationStatusHistory> builder)
    {
        builder.ToTable("job_application_status_history");
        builder.HasKey(history => history.Id);

        builder.Property(history => history.OldStatus)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(history => history.NewStatus)
            .HasConversion<string>()
            .HasMaxLength(20)
            .IsRequired();

        builder.HasOne<JobApplicationEntity>()
            .WithMany()
            .HasForeignKey(history => history.JobApplicationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(history => new { history.JobApplicationId, history.CreatedAtUtc });
    }
}
