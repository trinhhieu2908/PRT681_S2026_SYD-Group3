import { expect } from "@playwright/test";
import { test } from "../../fixtures";
import { errorMessage, expectStatus } from "../../utils/api-client";
import { utcDate } from "../../utils/test-data";

test.describe("Job applications API — search, filters, pagination", () => {
  test.beforeEach(async ({ api }) => {
    await api.createApplication({ companyName: "Google", roleTitle: "Data Analyst", platform: "LinkedIn" });
    await api.createApplication({ companyName: "Atlassian", roleTitle: "Frontend Developer", platform: "Seek" });
    const interview = await api.createApplication({ companyName: "Canva", roleTitle: "Backend Developer", platform: "linkedin" });
    await api.moveTo(interview.id, "Interview");
    const archived = await api.createApplication({ companyName: "Archived Co", roleTitle: "Tester", platform: "Indeed" });
    await api.moveTo(archived.id, "Rejected", "Archived");
  });

  const companies = async (res: import("@playwright/test").APIResponse) =>
    ((await res.json()).items as { companyName: string }[]).map((i) => i.companyName).sort();

  test("API-SF-01 default list excludes archived applications", async ({ api }) => {
    const res = await api.listApplications();
    await expectStatus(res, 200);
    expect(await companies(res)).toEqual(["Atlassian", "Canva", "Google"]);
  });

  test("API-SF-02 search matches company or role, case-insensitively", async ({ api }) => {
    expect(await companies(await api.listApplications({ search: "goo" }))).toEqual(["Google"]);
    expect(await companies(await api.listApplications({ search: "DEVELOPER" }))).toEqual(["Atlassian", "Canva"]);
  });

  test("API-SF-03 filter by status (including Archived explicitly)", async ({ api }) => {
    expect(await companies(await api.listApplications({ status: "Interview" }))).toEqual(["Canva"]);
    expect(await companies(await api.listApplications({ status: "Archived" }))).toEqual(["Archived Co"]);
  });

  test("API-SF-04 platform filter is an exact, case-insensitive match", async ({ api }) => {
    expect(await companies(await api.listApplications({ platform: "LINKEDIN" }))).toEqual(["Canva", "Google"]);
    expect(await companies(await api.listApplications({ platform: "Linked" }))).toEqual([]);
  });

  test("API-SF-05 combined search + filter", async ({ api }) => {
    expect(await companies(await api.listApplications({ search: "developer", platform: "Seek" }))).toEqual(["Atlassian"]);
  });

  test("API-SF-06 date range filter is inclusive", async ({ api }) => {
    expect(await companies(await api.listApplications({ fromDate: utcDate(), toDate: utcDate() }))).toHaveLength(3);
    expect(await companies(await api.listApplications({ fromDate: utcDate(1) }))).toEqual([]);
  });

  test("API-SF-07 fromDate later than toDate is rejected", async ({ api }) => {
    const res = await api.listApplications({ fromDate: utcDate(1), toDate: utcDate() });
    await expectStatus(res, 400);
    expect(await errorMessage(res)).toBe("From date cannot be later than to date.");
  });

  test("API-SF-08 pagination metadata is correct", async ({ api }) => {
    const res = await api.listApplications({ pageNumber: 2, pageSize: 2 });
    const page = await res.json();
    expect(page).toMatchObject({ pageNumber: 2, pageSize: 2, totalCount: 3, totalPages: 2, hasPreviousPage: true, hasNextPage: false });
    expect(page.items).toHaveLength(1);
  });

  for (const [params, label] of [
    [{ pageSize: 0 }, "pageSize 0"],
    [{ pageSize: 101 }, "pageSize 101"],
    [{ pageNumber: 0 }, "pageNumber 0"],
  ] as const) {
    test(`API-SF-09 invalid paging rejected: ${label}`, async ({ api }) => {
      await expectStatus(await api.listApplications(params), 400);
    });
  }
});
