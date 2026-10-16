using JobTrack.Database.Persistence;

namespace JobTrack.Database.SeedData;

public static class DatabaseSeeder
{
    public static Task SeedAsync(JobTrackDbContext dbContext, CancellationToken cancellationToken = default)
    {
        return Task.CompletedTask;
    }
}
