using JobTrack.Core.UnitOfWork;
using Microsoft.EntityFrameworkCore;

namespace JobTrack.Database.Persistence;

public class JobTrackDbContext(DbContextOptions<JobTrackDbContext> options)
    : DbContext(options), IUnitOfWork
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(JobTrackDbContext).Assembly);
    }
}
