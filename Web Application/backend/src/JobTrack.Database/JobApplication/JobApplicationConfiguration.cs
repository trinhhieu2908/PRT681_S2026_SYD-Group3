using JobTrack.Modules.JobApplication.Enums;
using JobTrack.Modules.Users.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using JobApplicationEntity = JobTrack.Modules.JobApplication.Entities.JobApplication;

namespace JobTrack.Database.JobApplication;

public sealed class JobApplicationConfiguration : IEntityTypeConfiguration<JobApplicationEntity>
{
    public void Configure(EntityTypeBuilder<JobApplicationEntity> builder)
    {
        builder.ToTable("job_application");
        builder.HasKey(application => application.Id);

        builder.Property(application => application.CompanyName)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(application => application.RoleTitle)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(application => application.Platform)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(application => application.ApplicationDate)
            .HasColumnType("date")
            .HasDefaultValueSql("(CURRENT_TIMESTAMP AT TIME ZONE 'UTC')::date")
            .IsRequired();

        builder.Property(application => application.CurrentStatus)
            .HasConversion<string>()
            .HasMaxLength(20)
            .HasDefaultValue(JobApplicationStatus.Applied)
            .IsRequired();

        builder.Property(application => application.JobLink)
            .HasMaxLength(2048);

        builder.Property(application => application.PortfolioLink)
            .HasMaxLength(2048);

        builder.Property(application => application.GitHubLink)
            .HasMaxLength(2048);

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(application => application.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(application => application.UserId);
        builder.HasIndex(application => new { application.UserId, application.CurrentStatus });
        builder.HasIndex(application => new { application.UserId, application.Platform });
        builder.HasIndex(application => new { application.UserId, application.ApplicationDate });
    }
}
