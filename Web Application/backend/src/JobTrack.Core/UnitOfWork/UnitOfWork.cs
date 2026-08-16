namespace JobTrack.Core.UnitOfWork;

public abstract class UnitOfWork : IUnitOfWork
{
    public abstract Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
