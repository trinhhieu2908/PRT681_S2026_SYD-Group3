import { expect } from "@playwright/test";
import { test } from "../../fixtures";
import { expectStatus } from "../../utils/api-client";

test.describe("Dashboard API", () => {
  test("API-DB-01 new user sees an empty summary", async ({ api }) => {
    const res = await api.get("/dashboard/summary");
    await expectStatus(res, 200);
    const s = await res.json();
    expect(s.activeApplicationCount).toBe(0);
    expect(s.upcomingInterviews).toEqual([]);
    expect(s.overdueFollowUps).toEqual([]);
  });

  test("API-DB-02 counts by status and platform exclude archived applications", async ({ api }) => {
    await api.createApplication({ platform: "LinkedIn" });
    await api.createApplication({ platform: "LinkedIn" });
    const seek = await api.createApplication({ platform: "Seek" });
    await api.moveTo(seek.id, "Interview");
    const archived = await api.createApplication({ platform: "Indeed" });
    await api.moveTo(archived.id, "Rejected", "Archived");

    const s = await (await api.get("/dashboard/summary")).json();
    expect(s.activeApplicationCount).toBe(3);
    const byStatus = Object.fromEntries(s.applicationsByStatus.map((x: { status: string; count: number }) => [x.status, x.count]));
    expect(byStatus).toMatchObject({ Applied: 2, Interview: 1 });
    expect(byStatus.Archived ?? 0).toBe(0);
    const byPlatform = Object.fromEntries(s.applicationsByPlatform.map((x: { platform: string; count: number }) => [x.platform, x.count]));
    expect(byPlatform).toEqual({ LinkedIn: 2, Seek: 1 });
  });

  test("API-DB-03 summary includes interviews in the next 7 days", async ({ api }) => {
    const app = await api.createApplication({ companyName: "DashCo" });
    await api.createInterview(app.id, { title: "Phone screen", interviewType: "Phone", scheduledAtUtc: new Date(Date.now() + 86_400_000).toISOString() });
    const s = await (await api.get("/dashboard/summary")).json();
    expect(s.upcomingInterviews).toHaveLength(1);
    expect(s.upcomingInterviews[0]).toMatchObject({ companyName: "DashCo", title: "Phone screen" });
  });

  test("API-DB-04 summary requires authentication", async ({ api }) => {
    await expectStatus(await api.get("/dashboard/summary", null), 401);
  });
});
