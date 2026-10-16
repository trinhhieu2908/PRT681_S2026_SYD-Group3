using JobTrack.Modules.Documents.Entities;
using JobTrack.Modules.Users.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobTrack.Database.Documents;

public sealed class ResumeConfiguration : IEntityTypeConfiguration<Resume>
{
    public void Configure(EntityTypeBuilder<Resume> builder)
    {
        builder.ToTable("resume");
        builder.HasKey(resume => resume.Id);

        builder.Property(resume => resume.FileName)
            .HasMaxLength(255)
            .IsRequired();

        builder.Property(resume => resume.ObjectKey)
            .HasMaxLength(1024)
            .IsRequired();

        builder.Property(resume => resume.ContentType)
            .HasMaxLength(127)
            .IsRequired();

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(resume => resume.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(resume => new { resume.UserId, resume.FileName })
            .IsUnique()
            .HasDatabaseName("UX_resume_UserId_FileName");

        builder.HasIndex(resume => resume.ObjectKey)
            .IsUnique()
            .HasDatabaseName("UX_resume_ObjectKey");
    }
}
