namespace JobTrack.Modules.Dashboard.Contracts;

public sealed record DashboardPlatformCountResponse(
    string Platform,
    int Count);
