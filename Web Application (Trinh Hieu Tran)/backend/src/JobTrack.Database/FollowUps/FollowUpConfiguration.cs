using JobTrack.Modules.FollowUps.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobTrack.Database.FollowUps;

public sealed class FollowUpConfiguration : IEntityTypeConfiguration<FollowUp>
{
    public void Configure(EntityTypeBuilder<FollowUp> builder)
    {
        builder.ToTable("follow_up", table =>
            table.HasCheckConstraint(
                "CK_follow_up_Completion",
                "(\"IsCompleted\" = TRUE AND \"CompletedAtUtc\" IS NOT NULL) "
                + "OR (\"IsCompleted\" = FALSE AND \"CompletedAtUtc\" IS NULL)"));
        builder.HasKey(followUp => followUp.Id);

        builder.Property(followUp => followUp.Title)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(followUp => followUp.DueDate)
            .HasColumnType("date")
            .IsRequired();

        builder.Property(followUp => followUp.Notes)
            .HasMaxLength(4000);

        builder.Property(followUp => followUp.IsCompleted)
            .HasDefaultValue(false)
            .IsRequired();

        builder.HasOne(followUp => followUp.JobApplication)
            .WithMany()
            .HasForeignKey(followUp => followUp.JobApplicationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(followUp => new
        {
            followUp.JobApplicationId,
            followUp.IsCompleted,
            followUp.DueDate,
        });
    }
}
