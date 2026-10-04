import { expect, test } from "../../fixtures";
import { JobApplicationsPage } from "../../pages/job-applications.page";
import { JobApplicationDetailPage } from "../../pages/job-application-detail.page";
import { uniqueSuffix } from "../../utils/test-data";

test.describe("UI — Job applications", () => {
  test("UI-JA-01 new user sees the empty state", async ({ authedPage: page }) => {
    const list = new JobApplicationsPage(page);
    await list.goto();
    await expect(page.getByText("Your next chapter starts here")).toBeVisible();
  });

  test("UI-JA-02 create a job application through the form", async ({ authedPage: page }) => {
    const list = new JobApplicationsPage(page);
    const company = `Atlassian ${uniqueSuffix()}`;
    await list.goto();
    await list.openCreateForm();
    await list.fillCreateForm({ companyName: company, roleTitle: "QA Engineer", platform: "LinkedIn", jobLink: "https://example.com/job" });
    await list.submitCreateForm();
    await expect(list.dialog).toBeHidden();
    await expect(list.card(company)).toBeVisible();
    await expect(list.card(company)).toContainText("Applied");
  });

  test("UI-JA-03 required fields are validated in the create form", async ({ authedPage: page }) => {
    const list = new JobApplicationsPage(page);
    await list.goto();
    await list.openCreateForm();
    await list.submitCreateForm();
    await expect(page.getByText("Company name is required")).toBeVisible();
    await expect(page.getByText("Role title is required")).toBeVisible();
    await expect(page.getByText("Platform is required")).toBeVisible();
    await expect(list.dialog).toBeVisible(); // nothing submitted
  });

  test("UI-JA-04 invalid job link URL is rejected in the create form", async ({ authedPage: page }) => {
    const list = new JobApplicationsPage(page);
    await list.goto();
    await list.openCreateForm();
    await list.fillCreateForm({ companyName: "X", roleTitle: "Y", platform: "Z", jobLink: "example.com" });
    await list.submitCreateForm();
    await expect(page.getByText("Enter a valid HTTP or HTTPS URL")).toBeVisible();
  });

  test("UI-JA-05 cancel closes the form without creating anything", async ({ authedPage: page, api }) => {
    const list = new JobApplicationsPage(page);
    await list.goto();
    await list.openCreateForm();
    await list.fillCreateForm({ companyName: "Should Not Exist", roleTitle: "Y", platform: "Z" });
    await list.dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(list.dialog).toBeHidden();
    expect((await (await api.listApplications()).json()).totalCount).toBe(0);
  });

  test("UI-JA-06 open an application's detail page from the list", async ({ authedPage: page, api }) => {
    const app = await api.createApplication({ companyName: "Canva", roleTitle: "Data Engineer" });
    const list = new JobApplicationsPage(page);
    await list.goto();
    await list.card("Canva").click();
    await expect(page).toHaveURL(new RegExp(`/job-applications/${app.id}$`));
    await expect(new JobApplicationDetailPage(page).roleHeading("Data Engineer")).toBeVisible();
  });

  test("UI-JA-07 inline edit of role title is saved", async ({ authedPage: page, api }) => {
    const app = await api.createApplication({ roleTitle: "Junior Developer" });
    const detail = new JobApplicationDetailPage(page);
    await detail.goto(app.id);
    await detail.editField("Role title", "Senior Developer");
    await expect(detail.roleHeading("Senior Developer")).toBeVisible();
    const saved = await (await api.get(`/job-applications/${app.id}`)).json();
    expect(saved.roleTitle).toBe("Senior Developer");
  });
});
