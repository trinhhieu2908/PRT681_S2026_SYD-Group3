using JobTrack.Modules.Interviews.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobTrack.Database.Interviews;

public sealed class InterviewConfiguration : IEntityTypeConfiguration<Interview>
{
    public void Configure(EntityTypeBuilder<Interview> builder)
    {
        builder.ToTable("interview");
        builder.HasKey(interview => interview.Id);

        builder.Property(interview => interview.Title)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(interview => interview.InterviewType)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(interview => interview.ScheduledAtUtc)
            .HasColumnType("timestamp with time zone")
            .IsRequired();

        builder.Property(interview => interview.Location)
            .HasMaxLength(250);

        builder.Property(interview => interview.MeetingLink)
            .HasMaxLength(2048);

        builder.Property(interview => interview.ContactName)
            .HasMaxLength(150);

        builder.Property(interview => interview.ContactEmail)
            .HasMaxLength(320);

        builder.Property(interview => interview.ContactPhone)
            .HasMaxLength(50);

        builder.Property(interview => interview.Notes)
            .HasMaxLength(4000);

        builder.HasOne(interview => interview.JobApplication)
            .WithMany()
            .HasForeignKey(interview => interview.JobApplicationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(interview => new
        {
            interview.JobApplicationId,
            interview.ScheduledAtUtc,
        });
    }
}
