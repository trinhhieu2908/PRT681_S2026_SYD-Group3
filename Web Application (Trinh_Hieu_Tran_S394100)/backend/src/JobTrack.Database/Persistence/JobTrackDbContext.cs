using JobTrack.Core.UnitOfWork;
using JobTrack.Modules.Documents.Entities;
using JobTrack.Modules.FollowUps.Entities;
using JobTrack.Modules.Interviews.Entities;
using JobTrack.Modules.JobApplication.Entities;
using JobTrack.Modules.Users.Entities;
using Microsoft.EntityFrameworkCore;
using JobApplicationEntity = JobTrack.Modules.JobApplication.Entities.JobApplication;

namespace JobTrack.Database.Persistence;

public class JobTrackDbContext(DbContextOptions<JobTrackDbContext> options)
    : DbContext(options), IUnitOfWork
{
    public DbSet<User> Users => Set<User>();

    public DbSet<JobApplicationEntity> JobApplications => Set<JobApplicationEntity>();

    public DbSet<JobApplicationStatusHistory> JobApplicationStatusHistories =>
        Set<JobApplicationStatusHistory>();

    public DbSet<Resume> Resumes => Set<Resume>();

    public DbSet<CoverLetter> CoverLetters => Set<CoverLetter>();

    public DbSet<Interview> Interviews => Set<Interview>();

    public DbSet<FollowUp> FollowUps => Set<FollowUp>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(JobTrackDbContext).Assembly);
    }
}
