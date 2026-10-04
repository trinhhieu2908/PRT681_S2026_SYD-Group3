import { expect } from "@playwright/test";
import { test } from "../../fixtures";
import { errorMessage, expectStatus, JobTrackApi } from "../../utils/api-client";
import { newApplication, utcDate } from "../../utils/test-data";

test.describe("Job applications API — CRUD and validation", () => {
  test("API-JA-01 create application sets Applied status and today's date", async ({ api }) => {
    const res = await api.post("/job-applications", newApplication({ companyName: "Atlassian" }));
    await expectStatus(res, 201);
    const app = await res.json();
    expect(app).toMatchObject({ companyName: "Atlassian", currentStatus: "Applied", applicationDate: utcDate() });
    expect(app.id).toBeTruthy();
  });

  test("API-JA-02 text fields are trimmed and omitted links are null", async ({ api }) => {
    const app = await api.createApplication({ companyName: "  Canva  ", roleTitle: " QA ", jobLink: null });
    expect(app).toMatchObject({ companyName: "Canva", roleTitle: "QA", jobLink: null });
  });

  for (const field of ["companyName", "roleTitle", "platform"] as const) {
    test(`API-JA-03 ${field} is required`, async ({ api }) => {
      const res = await api.post("/job-applications", newApplication({ [field]: "   " }));
      await expectStatus(res, 400);
      expect(await errorMessage(res)).toMatch(/is required/);
    });
  }

  test("API-JA-04 field length limits are enforced (company 150, platform 50)", async ({ api }) => {
    await expectStatus(await api.post("/job-applications", newApplication({ companyName: "x".repeat(151) })), 400);
    await expectStatus(await api.post("/job-applications", newApplication({ platform: "x".repeat(51) })), 400);
    await expectStatus(await api.post("/job-applications", newApplication({ companyName: "x".repeat(150) })), 201);
  });

  test("API-JA-05 invalid job link URL is rejected", async ({ api }) => {
    await expectStatus(await api.post("/job-applications", newApplication({ jobLink: "not a url" })), 400);
  });

  test("API-JA-06 get by id returns detail with no documents attached", async ({ api }) => {
    const created = await api.createApplication();
    const res = await api.get(`/job-applications/${created.id}`);
    await expectStatus(res, 200);
    expect(await res.json()).toMatchObject({ id: created.id, resume: null, coverLetter: null });
  });

  test("API-JA-07 unknown id returns 404", async ({ api }) => {
    await expectStatus(await api.get("/job-applications/00000000-0000-0000-0000-000000000000"), 404);
  });

  test("API-JA-08 partial update changes only supplied fields", async ({ api }) => {
    const created = await api.createApplication({ roleTitle: "Junior Dev", platform: "Seek" });
    const res = await api.put(`/job-applications/${created.id}`, { roleTitle: "Senior Dev", applicationDate: "2026-09-01" });
    await expectStatus(res, 200);
    const updated = await res.json();
    expect(updated).toMatchObject({ roleTitle: "Senior Dev", platform: "Seek", applicationDate: "2026-09-01", currentStatus: "Applied" });
    expect(updated.updatedAtUtc).toBeTruthy();
  });

  test("API-JA-09 update with blank required field is rejected", async ({ api }) => {
    const created = await api.createApplication();
    await expectStatus(await api.put(`/job-applications/${created.id}`, { companyName: "" }), 400);
  });

  // README: "An empty string can be used to clear an optional link." The detail page relies on
  // this (useUpdateJobApplication sends "" when a link is cleared). NOTE: UpdateJobApplicationRequest
  // has [Url] on the link fields, and .NET's UrlAttribute rejects "", so this is expected to FAIL
  // on the real backend until that is fixed — i.e. this test documents a probable defect.
  test("API-JA-10 update with empty string clears an optional link", async ({ api }) => {
    const created = await api.createApplication({ jobLink: "https://example.com/job" });
    const res = await api.put(`/job-applications/${created.id}`, { jobLink: "" });
    await expectStatus(res, 200);
    expect((await res.json()).jobLink).toBeNull();
  });
});

test.describe("Job applications API — data isolation between users", () => {
  test("API-JA-11 a user cannot read, update or change status of another user's application", async ({ api, request }) => {
    const victimApp = await api.createApplication();
    const attacker = new JobTrackApi(request);
    await attacker.createUser();
    await expectStatus(await attacker.get(`/job-applications/${victimApp.id}`), 404);
    await expectStatus(await attacker.put(`/job-applications/${victimApp.id}`, { companyName: "Hacked" }), 404);
    await expectStatus(await attacker.changeStatus(victimApp.id, "Interview"), 404);
    const list = await (await attacker.listApplications()).json();
    expect(list.totalCount).toBe(0);
  });
});
