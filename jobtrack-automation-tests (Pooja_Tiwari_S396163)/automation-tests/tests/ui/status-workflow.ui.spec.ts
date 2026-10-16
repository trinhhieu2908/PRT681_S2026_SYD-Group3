import { expect, test } from "../../fixtures";
import { JobApplicationDetailPage } from "../../pages/job-application-detail.page";

test.describe("UI — Status workflow on the detail page", () => {
  test("UI-WF-01 move Applied -> Interview -> Offer", async ({ authedPage: page, api }) => {
    const app = await api.createApplication();
    const detail = new JobApplicationDetailPage(page);
    await detail.goto(app.id);

    await detail.performStatusAction(/Move to interview/, "Move to Interview");
    await expect(page.getByRole("button", { name: /Record an offer/ })).toBeVisible();
    await detail.performStatusAction(/Record an offer/, "Move to Offer");

    const saved = await (await api.get(`/job-applications/${app.id}`)).json();
    expect(saved.currentStatus).toBe("Offer");
  });

  test("UI-WF-02 skip straight to offer from Applied (with confirmation)", async ({ authedPage: page, api }) => {
    const app = await api.createApplication();
    const detail = new JobApplicationDetailPage(page);
    await detail.goto(app.id);
    await page.getByRole("button", { name: /Record an offer/ }).click();
    await expect(detail.dialog.getByText("Skip straight to offer?")).toBeVisible();
    await detail.dialog.getByRole("button", { name: "Record offer" }).click();
    await expect.poll(async () => (await (await api.get(`/job-applications/${app.id}`)).json()).currentStatus).toBe("Offer");
  });

  test("UI-WF-03 cancelling the confirmation keeps the current status", async ({ authedPage: page, api }) => {
    const app = await api.createApplication();
    const detail = new JobApplicationDetailPage(page);
    await detail.goto(app.id);
    await detail.cancelStatusAction(/Mark as rejected/);
    const saved = await (await api.get(`/job-applications/${app.id}`)).json();
    expect(saved.currentStatus).toBe("Applied");
  });

  test("UI-WF-04 reject, archive, then restore the application", async ({ authedPage: page, api }) => {
    const app = await api.createApplication();
    const detail = new JobApplicationDetailPage(page);
    await detail.goto(app.id);

    await detail.performStatusAction(/Mark as rejected/, "Mark rejected");
    await detail.performStatusAction(/Archive application/, "Archive");
    await expect(page.getByRole("heading", { name: "Return to your journey" })).toBeVisible();

    await page.getByRole("button", { name: /Restore/ }).first().click();
    await detail.dialog.getByRole("button", { name: "Restore application" }).click();
    await expect.poll(async () => (await (await api.get(`/job-applications/${app.id}`)).json()).currentStatus).toBe("Rejected");
  });

  test("UI-WF-05 rejected application only offers the Archive action", async ({ authedPage: page, api }) => {
    const app = await api.createApplication();
    await api.moveTo(app.id, "Rejected");
    await new JobApplicationDetailPage(page).goto(app.id);
    await expect(page.getByRole("button", { name: /Archive application/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /Move to interview/ })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Record an offer/ })).toHaveCount(0);
  });
});
