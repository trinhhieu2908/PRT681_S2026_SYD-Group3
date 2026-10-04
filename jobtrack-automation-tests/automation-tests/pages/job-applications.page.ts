import { expect, Locator, Page } from "@playwright/test";

export class JobApplicationsPage {
  readonly addButton: Locator;
  readonly search: Locator;
  readonly filtersButton: Locator;
  readonly dialog: Locator;

  constructor(private readonly page: Page) {
    this.addButton = page.getByRole("button", { name: "Add opportunity" });
    this.search = page.locator("#job-application-search");
    this.filtersButton = page.getByRole("button", { name: /^Filters/ });
    this.dialog = page.getByRole("dialog");
  }

  async goto() {
    await this.page.goto("/job-applications");
    await expect(this.page.getByRole("heading", { name: "Every opportunity has a story." })).toBeVisible();
  }

  /** Application cards are links labelled "View <role> at <company>". */
  card(company: string) {
    return this.page.getByRole("link", { name: new RegExp(`at ${escape(company)}$`) });
  }
  cards() {
    return this.page.getByRole("link", { name: /^View .+ at .+/ });
  }

  async openCreateForm() {
    await this.addButton.click();
    await expect(this.dialog.getByRole("heading", { name: "Create job application" })).toBeVisible();
  }

  async fillCreateForm(data: { companyName?: string; roleTitle?: string; platform?: string; jobLink?: string }) {
    if (data.companyName !== undefined) await this.page.locator("#company-name").fill(data.companyName);
    if (data.roleTitle !== undefined) await this.page.locator("#role-title").fill(data.roleTitle);
    if (data.platform !== undefined) await this.page.locator("#platform").fill(data.platform);
    if (data.jobLink !== undefined) await this.page.locator("#job-link").fill(data.jobLink);
  }

  async submitCreateForm() {
    await this.dialog.getByRole("button", { name: "Create job application" }).click();
  }

  async applyFilters(f: { status?: string; platform?: string; fromDate?: string; toDate?: string }) {
    await this.filtersButton.click();
    if (f.status) {
      await this.page.locator("#job-application-status").click();
      await this.page.getByRole("option", { name: f.status, exact: true }).click();
    }
    if (f.platform !== undefined) await this.page.locator("#job-application-platform").fill(f.platform);
    if (f.fromDate !== undefined) await this.page.locator("#job-application-from-date").fill(f.fromDate);
    if (f.toDate !== undefined) await this.page.locator("#job-application-to-date").fill(f.toDate);
    await this.page.getByRole("button", { name: "Apply filters" }).click();
  }
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
