import { expect } from "@playwright/test";
import { test } from "../../fixtures";
import { errorMessage, expectStatus, JobTrackApi } from "../../utils/api-client";
import { utcDate } from "../../utils/test-data";

test.describe("Follow-ups API", () => {
  test("API-FU-01 create follow-up for an application", async ({ api }) => {
    const app = await api.createApplication();
    const res = await api.post(`/job-applications/${app.id}/follow-ups`, { title: "Email recruiter", dueDate: utcDate(3), notes: "Ask about timeline" });
    await expectStatus(res, 201);
    expect(await res.json()).toMatchObject({ title: "Email recruiter", dueDate: utcDate(3), isCompleted: false, isOverdue: false });
  });

  test("API-FU-02 due date in the past is rejected, today is allowed", async ({ api }) => {
    const app = await api.createApplication();
    const past = await api.post(`/job-applications/${app.id}/follow-ups`, { title: "Too late", dueDate: utcDate(-1) });
    await expectStatus(past, 400);
    expect(await errorMessage(past)).toBe("Follow-up due date cannot be in the past.");
    await expectStatus(await api.post(`/job-applications/${app.id}/follow-ups`, { title: "Today", dueDate: utcDate() }), 201);
  });

  test("API-FU-03 title is required", async ({ api }) => {
    const app = await api.createApplication();
    await expectStatus(await api.post(`/job-applications/${app.id}/follow-ups`, { title: " ", dueDate: utcDate(1) }), 400);
  });

  test("API-FU-04 mark complete, then reopen", async ({ api }) => {
    const app = await api.createApplication();
    const fu = await api.createFollowUp(app.id, { title: "Call HR", dueDate: utcDate(1) });
    const done = await (await api.patch(`/job-applications/${app.id}/follow-ups/${fu.id}/completion`, { isCompleted: true })).json();
    expect(done.isCompleted).toBe(true);
    expect(done.completedAtUtc).toBeTruthy();
    const reopened = await (await api.patch(`/job-applications/${app.id}/follow-ups/${fu.id}/completion`, { isCompleted: false })).json();
    expect(reopened).toMatchObject({ isCompleted: false, completedAtUtc: null });
  });

  test("API-FU-05 pending list shows only incomplete follow-ups, ordered by due date", async ({ api }) => {
    const app = await api.createApplication({ companyName: "PendingCo" });
    await api.createFollowUp(app.id, { title: "Later", dueDate: utcDate(5) });
    await api.createFollowUp(app.id, { title: "Sooner", dueDate: utcDate(1) });
    const done = await api.createFollowUp(app.id, { title: "Done", dueDate: utcDate(2) });
    await api.patch(`/job-applications/${app.id}/follow-ups/${done.id}/completion`, { isCompleted: true });
    const pending = await (await api.get("/follow-ups/pending")).json();
    expect(pending.map((p: { title: string }) => p.title)).toEqual(["Sooner", "Later"]);
    expect(pending[0].companyName).toBe("PendingCo");
  });

  test("API-FU-06 update and delete a follow-up", async ({ api }) => {
    const app = await api.createApplication();
    const fu = await api.createFollowUp(app.id, { title: "Draft", dueDate: utcDate(1) });
    const upd = await api.patch(`/job-applications/${app.id}/follow-ups/${fu.id}`, { title: "Final" });
    expect((await upd.json()).title).toBe("Final");
    await expectStatus(await api.delete(`/job-applications/${app.id}/follow-ups/${fu.id}`), 204);
    await expectStatus(await api.get(`/job-applications/${app.id}/follow-ups/${fu.id}`), 404);
  });

  test("API-FU-07 another user cannot access follow-ups", async ({ api, request }) => {
    const app = await api.createApplication();
    const fu = await api.createFollowUp(app.id, { title: "Private", dueDate: utcDate(1) });
    const other = new JobTrackApi(request);
    await other.createUser();
    await expectStatus(await other.get(`/job-applications/${app.id}/follow-ups`), 404);
    await expectStatus(await other.delete(`/job-applications/${app.id}/follow-ups/${fu.id}`), 404);
  });
});

test.describe("Interviews API", () => {
  const interview = (offsetDays: number, extra: Record<string, unknown> = {}) => ({
    title: "Technical round",
    interviewType: "Technical",
    scheduledAtUtc: new Date(Date.now() + offsetDays * 86_400_000).toISOString(),
    meetingLink: "https://meet.example.com/abc",
    contactEmail: "recruiter@example.com",
    ...extra,
  });

  test("API-IV-01 create and fetch an interview", async ({ api }) => {
    const app = await api.createApplication();
    const created = await api.createInterview(app.id, interview(2));
    const res = await api.get(`/job-applications/${app.id}/interviews/${created.id}`);
    await expectStatus(res, 200);
    expect(await res.json()).toMatchObject({ title: "Technical round", interviewType: "Technical" });
  });

  test("API-IV-02 required fields and formats are validated", async ({ api }) => {
    const app = await api.createApplication();
    const url = `/job-applications/${app.id}/interviews`;
    await expectStatus(await api.post(url, interview(1, { title: "" })), 400);
    await expectStatus(await api.post(url, interview(1, { scheduledAtUtc: null })), 400);
    await expectStatus(await api.post(url, interview(1, { contactEmail: "bad-email" })), 400);
    await expectStatus(await api.post(url, interview(1, { meetingLink: "not a url" })), 400);
  });

  test("API-IV-03 upcoming returns interviews within the requested window only", async ({ api }) => {
    const app = await api.createApplication({ companyName: "UpcomingCo" });
    await api.createInterview(app.id, interview(2, { title: "Soon" }));
    await api.createInterview(app.id, interview(20, { title: "Far" }));
    await api.createInterview(app.id, interview(-1, { title: "Past" }));
    const week = await (await api.get("/interviews/upcoming?days=7")).json();
    expect(week.map((i: { title: string }) => i.title)).toEqual(["Soon"]);
    expect(week[0].companyName).toBe("UpcomingCo");
    const month = await (await api.get("/interviews/upcoming?days=30")).json();
    expect(month.map((i: { title: string }) => i.title)).toEqual(["Soon", "Far"]);
  });

  test("API-IV-04 upcoming days must be 1-30", async ({ api }) => {
    await expectStatus(await api.get("/interviews/upcoming?days=0"), 400);
    await expectStatus(await api.get("/interviews/upcoming?days=31"), 400);
  });

  test("API-IV-05 delete an interview", async ({ api }) => {
    const app = await api.createApplication();
    const created = await api.createInterview(app.id, interview(3));
    await expectStatus(await api.delete(`/job-applications/${app.id}/interviews/${created.id}`), 204);
    await expectStatus(await api.get(`/job-applications/${app.id}/interviews/${created.id}`), 404);
  });
});
