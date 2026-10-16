using JobTrack.Modules.Documents.Entities;
using JobTrack.Modules.Users.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using JobApplicationEntity = JobTrack.Modules.JobApplication.Entities.JobApplication;

namespace JobTrack.Database.Documents;

public sealed class CoverLetterConfiguration : IEntityTypeConfiguration<CoverLetter>
{
    public void Configure(EntityTypeBuilder<CoverLetter> builder)
    {
        builder.ToTable("cover_letter");
        builder.HasKey(coverLetter => coverLetter.Id);

        builder.Property(coverLetter => coverLetter.FileName)
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(coverLetter => coverLetter.ObjectKey)
            .HasMaxLength(1024)
            .IsRequired();

        builder.Property(coverLetter => coverLetter.ContentType)
            .HasMaxLength(127)
            .IsRequired();

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(coverLetter => coverLetter.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<JobApplicationEntity>()
            .WithOne(jobApplication => jobApplication.CoverLetter)
            .HasForeignKey<CoverLetter>(coverLetter => coverLetter.JobApplicationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(coverLetter => coverLetter.JobApplicationId)
            .IsUnique()
            .HasDatabaseName("UX_cover_letter_JobApplicationId");

        builder.HasIndex(coverLetter => coverLetter.ObjectKey)
            .IsUnique()
            .HasDatabaseName("UX_cover_letter_ObjectKey");
    }
}
