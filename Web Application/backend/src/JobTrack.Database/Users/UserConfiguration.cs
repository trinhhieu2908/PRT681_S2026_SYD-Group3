using JobTrack.Modules.Users.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobTrack.Database.Users;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("users");
        builder.HasKey(user => user.Id);

        builder.Property(user => user.Email)
            .HasMaxLength(254)
            .IsRequired();

        builder.Property(user => user.NormalizedEmail)
            .HasMaxLength(254)
            .IsRequired();

        builder.Property(user => user.PasswordHash)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(user => user.RefreshTokenHash)
            .HasMaxLength(128);

        builder.HasIndex(user => user.NormalizedEmail)
            .IsUnique();
    }
}
