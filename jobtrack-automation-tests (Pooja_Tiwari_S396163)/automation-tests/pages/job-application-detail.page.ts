import { expect, Locator, Page } from "@playwright/test";

export class JobApplicationDetailPage {
  readonly dialog: Locator;

  constructor(private readonly page: Page) {
    this.dialog = page.getByRole("dialog");
  }

  async goto(id: string) {
    await this.page.goto(`/job-applications/${id}`);
  }

  roleHeading(roleTitle: string) {
    return this.page.getByRole("heading", { level: 1, name: roleTitle });
  }

  /** Clicks a status action (e.g. "Move to interview") and accepts the confirmation dialog. */
  async performStatusAction(actionLabel: string | RegExp, confirmLabel: string | RegExp) {
    await this.page.getByRole("button", { name: actionLabel }).click();
    await expect(this.dialog).toBeVisible();
    await this.dialog.getByRole("button", { name: confirmLabel }).click();
    await expect(this.dialog).toBeHidden();
  }

  async cancelStatusAction(actionLabel: string | RegExp) {
    await this.page.getByRole("button", { name: actionLabel }).click();
    await this.dialog.getByRole("button", { name: "Keep current status" }).click();
    await expect(this.dialog).toBeHidden();
  }

  /** Inline edit of a field such as "Company name", "Role title", "Platform". */
  async editField(label: string, value: string) {
    await this.page.getByRole("button", { name: `Edit ${label.toLowerCase()}` }).click();
    const input = this.page.getByRole("textbox", { name: label });
    await input.fill(value);
    await this.page.getByRole("button", { name: `Save ${label.toLowerCase()}` }).click();
  }

  async addFollowUp(data: { title: string; dueDate: string; notes?: string }) {
    await this.page.getByRole("button", { name: "Add follow-up" }).first().click();
    await expect(this.dialog.getByRole("heading", { name: "Add follow-up" })).toBeVisible();
    await this.page.locator("#follow-up-title").fill(data.title);
    await this.page.locator("#follow-up-due-date").fill(data.dueDate);
    if (data.notes) await this.page.locator("#follow-up-notes").fill(data.notes);
    await this.dialog.getByRole("button", { name: "Add follow-up" }).click();
  }
}
