using JobTrack.Core.UnitOfWork;
using JobTrack.Modules.Users.Entities;
using Microsoft.EntityFrameworkCore;

namespace JobTrack.Database.Persistence;

public class JobTrackDbContext(DbContextOptions<JobTrackDbContext> options)
    : DbContext(options), IUnitOfWork
{
    public DbSet<User> Users => Set<User>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(JobTrackDbContext).Assembly);
    }
}
