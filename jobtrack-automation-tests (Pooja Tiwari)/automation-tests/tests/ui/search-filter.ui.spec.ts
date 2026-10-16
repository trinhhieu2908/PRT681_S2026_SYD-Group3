import { expect, test } from "../../fixtures";
import { JobApplicationsPage } from "../../pages/job-applications.page";

test.describe("UI — Search and filter", () => {
  test.beforeEach(async ({ api }) => {
    await api.createApplication({ companyName: "Google", roleTitle: "Data Analyst", platform: "LinkedIn" });
    await api.createApplication({ companyName: "Atlassian", roleTitle: "Frontend Developer", platform: "Seek" });
    const canva = await api.createApplication({ companyName: "Canva", roleTitle: "Backend Developer", platform: "LinkedIn" });
    await api.moveTo(canva.id, "Interview");
  });

  test("UI-SF-01 all active applications are listed with a count", async ({ authedPage: page }) => {
    const list = new JobApplicationsPage(page);
    await list.goto();
    await expect(list.cards()).toHaveCount(3);
    await expect(page.getByText(/of 3 opportunities/)).toBeVisible();
  });

  test("UI-SF-02 search by company name", async ({ authedPage: page }) => {
    const list = new JobApplicationsPage(page);
    await list.goto();
    await list.search.fill("goog");
    await expect(list.cards()).toHaveCount(1);
    await expect(list.card("Google")).toBeVisible();
  });

  test("UI-SF-03 search by role title", async ({ authedPage: page }) => {
    const list = new JobApplicationsPage(page);
    await list.goto();
    await list.search.fill("developer");
    await expect(list.cards()).toHaveCount(2);
  });

  test("UI-SF-04 no-match search shows the empty result and can be cleared", async ({ authedPage: page }) => {
    const list = new JobApplicationsPage(page);
    await list.goto();
    await list.search.fill("zzz-no-match");
    await expect(page.getByText("No opportunities match")).toBeVisible();
    await page.getByRole("button", { name: "Clear search and filters" }).click();
    await expect(list.cards()).toHaveCount(3);
  });

  test("UI-SF-05 filter by status", async ({ authedPage: page }) => {
    const list = new JobApplicationsPage(page);
    await list.goto();
    await list.applyFilters({ status: "Interview" });
    await expect(list.cards()).toHaveCount(1);
    await expect(list.card("Canva")).toBeVisible();
  });

  test("UI-SF-06 filter by platform", async ({ authedPage: page }) => {
    const list = new JobApplicationsPage(page);
    await list.goto();
    await list.applyFilters({ platform: "LinkedIn" });
    await expect(list.cards()).toHaveCount(2);
    await expect(list.filtersButton).toContainText("1"); // active filter badge
  });

  // The "To date" input has min={fromDate}, so the browser's native validation blocks the
  // submit before the app's own "From date cannot be later than to date." message can render.
  // We assert the observable behaviour: the invalid range is never applied.
  test("UI-SF-07 an invalid date range (from > to) cannot be applied", async ({ authedPage: page }) => {
    const list = new JobApplicationsPage(page);
    await list.goto();
    await list.applyFilters({ fromDate: "2026-12-31", toDate: "2026-01-01" });
    const toDate = page.locator("#job-application-to-date");
    expect(await toDate.evaluate((el: HTMLInputElement) => el.validity.rangeUnderflow)).toBe(true);
    await expect(page.locator("#job-application-filters")).toBeVisible(); // panel stays open
    await expect(list.filtersButton).not.toContainText(/\d/);             // no filter applied
    await expect(list.cards()).toHaveCount(3);
  });

  test("UI-SF-08 'Clear all' resets search and filters", async ({ authedPage: page }) => {
    const list = new JobApplicationsPage(page);
    await list.goto();
    await list.search.fill("google");
    await expect(list.cards()).toHaveCount(1);
    await page.getByRole("button", { name: "Clear all" }).click();
    await expect(list.search).toHaveValue("");
    await expect(list.cards()).toHaveCount(3);
  });
});
