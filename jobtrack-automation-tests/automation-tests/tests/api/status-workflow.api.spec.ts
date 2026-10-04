import { expect } from "@playwright/test";
import { test } from "../../fixtures";
import { errorMessage, expectStatus } from "../../utils/api-client";

/**
 * Status workflow (JobApplicationStatusWorkflow.cs):
 *   Applied   -> Interview | Rejected | Withdrawn | (Offer only with skipToOffer)
 *   Interview -> Offer | Rejected | Withdrawn
 *   Offer     -> Withdrawn | Archived
 *   Rejected  -> Archived
 *   Withdrawn -> Archived
 *   Archived  -> (only via /unarchive, restores previous status)
 */
const VALID: [string[], string][] = [
  [[], "Interview"], [[], "Rejected"], [[], "Withdrawn"],
  [["Interview"], "Offer"], [["Interview"], "Rejected"], [["Interview"], "Withdrawn"],
  [["Interview", "Offer"], "Withdrawn"], [["Interview", "Offer"], "Archived"],
  [["Rejected"], "Archived"], [["Withdrawn"], "Archived"],
];
const INVALID: [string[], string][] = [
  [["Interview"], "Applied"], [["Rejected"], "Applied"], [["Rejected"], "Interview"],
  [["Withdrawn"], "Interview"], [["Interview", "Offer"], "Rejected"], [[], "Archived"],
];

test.describe("Status workflow API", () => {
  for (const [path, target] of VALID) {
    const from = path.at(-1) ?? "Applied";
    test(`API-WF-01 allowed: ${from} -> ${target}`, async ({ api }) => {
      const app = await api.createApplication();
      await api.moveTo(app.id, ...path);
      const res = await api.changeStatus(app.id, target);
      await expectStatus(res, 200);
      expect((await res.json()).currentStatus).toBe(target);
    });
  }

  for (const [path, target] of INVALID) {
    const from = path.at(-1) ?? "Applied";
    test(`API-WF-02 blocked: ${from} -> ${target}`, async ({ api }) => {
      const app = await api.createApplication();
      await api.moveTo(app.id, ...path);
      const res = await api.changeStatus(app.id, target);
      await expectStatus(res, 400);
      expect(await errorMessage(res)).toContain("not allowed");
    });
  }

  test("API-WF-03 Applied -> Offer requires the skip-to-offer override", async ({ api }) => {
    const app = await api.createApplication();
    const blocked = await api.changeStatus(app.id, "Offer");
    await expectStatus(blocked, 400);
    expect(await errorMessage(blocked)).toContain("skip-to-offer");
    await expectStatus(await api.changeStatus(app.id, "Offer", true), 200);
  });

  test("API-WF-04 skip-to-offer cannot be used for any other transition", async ({ api }) => {
    const app = await api.createApplication();
    const res = await api.changeStatus(app.id, "Interview", true);
    await expectStatus(res, 400);
    expect(await errorMessage(res)).toContain("only valid for an Applied to Offer");
  });

  test("API-WF-05 changing to the current status is rejected", async ({ api }) => {
    const app = await api.createApplication();
    const res = await api.changeStatus(app.id, "Applied");
    await expectStatus(res, 400);
    expect(await errorMessage(res)).toBe("The application is already in Applied status.");
  });

  test("API-WF-06 archived application cannot change status directly", async ({ api }) => {
    const app = await api.createApplication();
    await api.moveTo(app.id, "Withdrawn", "Archived");
    const res = await api.changeStatus(app.id, "Withdrawn");
    await expectStatus(res, 400);
    expect(await errorMessage(res)).toContain("unarchive");
  });

  test("API-WF-07 unarchive restores the status held before archiving", async ({ api }) => {
    const app = await api.createApplication();
    await api.moveTo(app.id, "Interview", "Offer", "Archived");
    const res = await api.post(`/job-applications/${app.id}/unarchive`);
    await expectStatus(res, 200);
    expect((await res.json()).currentStatus).toBe("Offer");
  });

  test("API-WF-08 unarchive on a non-archived application is rejected", async ({ api }) => {
    const app = await api.createApplication();
    const res = await api.post(`/job-applications/${app.id}/unarchive`);
    await expectStatus(res, 400);
    expect(await errorMessage(res)).toBe("Only an archived application can be unarchived.");
  });

  test("API-WF-09 unsupported or missing status value is rejected", async ({ api }) => {
    const app = await api.createApplication();
    await expectStatus(await api.patch(`/job-applications/${app.id}/status`, { newStatus: "Hired" }), 400);
    await expectStatus(await api.patch(`/job-applications/${app.id}/status`, {}), 400);
  });
});
