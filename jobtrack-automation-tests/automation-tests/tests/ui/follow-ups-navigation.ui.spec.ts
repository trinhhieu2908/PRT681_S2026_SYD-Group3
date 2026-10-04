import { expect, test } from "../../fixtures";
import { JobApplicationDetailPage } from "../../pages/job-application-detail.page";
import { utcDate } from "../../utils/test-data";

test.describe("UI — Follow-ups", () => {
  test("UI-FU-01 add a follow-up from the application detail page", async ({ authedPage: page, api }) => {
    const app = await api.createApplication();
    const detail = new JobApplicationDetailPage(page);
    await detail.goto(app.id);
    await detail.addFollowUp({ title: "Send thank-you email", dueDate: utcDate(2), notes: "Mention the team lunch" });
    await expect(detail.dialog).toBeHidden();
    await expect(page.getByText("Send thank-you email added.")).toBeVisible(); // toast
    await expect(page.getByRole("heading", { name: "Send thank-you email" })).toBeVisible();
  });

  test("UI-FU-02 follow-up title is required", async ({ authedPage: page, api }) => {
    const app = await api.createApplication();
    const detail = new JobApplicationDetailPage(page);
    await detail.goto(app.id);
    await detail.addFollowUp({ title: "", dueDate: utcDate(2) });
    await expect(page.getByText("Follow-up title is required")).toBeVisible();
  });

  test("UI-FU-03 mark a follow-up as done", async ({ authedPage: page, api }) => {
    const app = await api.createApplication();
    const fu = await api.createFollowUp(app.id, { title: "Call recruiter", dueDate: utcDate(1) });
    await new JobApplicationDetailPage(page).goto(app.id);
    await page.getByRole("button", { name: "Mark follow-up done" }).first().click();
    await expect.poll(async () =>
      (await (await api.get(`/job-applications/${app.id}/follow-ups/${fu.id}`)).json()).isCompleted).toBe(true);
  });

  test("UI-FU-04 delete a follow-up", async ({ authedPage: page, api }) => {
    const app = await api.createApplication();
    await api.createFollowUp(app.id, { title: "Remove me", dueDate: utcDate(1) });
    await new JobApplicationDetailPage(page).goto(app.id);
    await page.getByRole("button", { name: "Delete Remove me" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Delete follow-up" }).click();
    await expect(page.getByText("Remove me")).toHaveCount(0);
  });

  test("UI-FU-05 open follow-ups page lists pending follow-ups", async ({ authedPage: page, api }) => {
    const app = await api.createApplication({ companyName: "FollowCo" });
    await api.createFollowUp(app.id, { title: "Check application portal", dueDate: utcDate(3) });
    await page.goto("/follow-ups");
    await expect(page.getByRole("heading", { name: "Open follow-ups" })).toBeVisible();
    await expect(page.getByText("Check application portal")).toBeVisible();
  });
});

test.describe("UI — Navigation, dashboard and logout", () => {
  test("UI-NAV-01 sidebar navigates between all pages", async ({ authedPage: page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Make the next move count." })).toBeVisible();
    const nav = page.locator("aside");
    await nav.getByRole("link", { name: "Job application" }).click();
    await expect(page).toHaveURL(/\/job-applications$/);
    await nav.getByRole("link", { name: "Interviews" }).click();
    await expect(page.getByRole("heading", { name: "Walk into every interview ready." })).toBeVisible();
    await nav.getByRole("link", { name: "Follow-ups" }).click();
    await expect(page.getByRole("heading", { name: "Open follow-ups" })).toBeVisible();
    await nav.getByRole("link", { name: "Dashboard" }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("UI-NAV-02 dashboard shows the active application count", async ({ authedPage: page, api }) => {
    await api.createApplication();
    await api.createApplication();
    await page.goto("/");
    const activeTile = page.getByText("Active", { exact: true }).locator("..");
    await expect(activeTile).toContainText("2");
  });

  test("UI-NAV-03 sign out returns to login and protects pages again", async ({ authedPage: page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Sign Out" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Logout" }).click();
    await expect(page).toHaveURL(/\/login$/);
    await page.goto("/job-applications");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("UI-NAV-04 unknown route shows the not-found page", async ({ authedPage: page }) => {
    await page.goto("/this-page-does-not-exist");
    await expect(page.getByText(/not found|404/i).first()).toBeVisible();
  });
});
