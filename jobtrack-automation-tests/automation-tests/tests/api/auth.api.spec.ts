import { test, expect } from "@playwright/test";
import { errorMessage, expectStatus, JobTrackApi } from "../../utils/api-client";
import { uniqueEmail, VALID_PASSWORD } from "../../utils/test-data";

test.describe("Authentication API", () => {
  test("API-AUTH-01 register a new user returns 201 with tokens", async ({ request }) => {
    const api = new JobTrackApi(request);
    const email = uniqueEmail();
    const res = await api.register(email, VALID_PASSWORD);
    await expectStatus(res, 201);
    const body = await res.json();
    expect(body.email).toBe(email);
    expect(body.userId).toMatch(/^[0-9a-f-]{36}$/);
    expect(body.tokens.accessToken.split(".")).toHaveLength(3); // JWT
    expect(body.tokens.refreshToken).toBeTruthy();
  });

  test("API-AUTH-02 duplicate email is rejected (case-insensitive)", async ({ request }) => {
    const api = new JobTrackApi(request);
    const email = uniqueEmail();
    await expectStatus(await api.register(email, VALID_PASSWORD), 201);
    const res = await api.register(email.toUpperCase(), VALID_PASSWORD);
    await expectStatus(res, 400);
    expect(await errorMessage(res)).toBe("The email address is already registered.");
  });

  const weakPasswords: [string, string, string][] = [
    ["short", "Ab1!", "8 characters"], // caught by model validation (length)
    ["no uppercase", "lowercase1!", "uppercase"],
    ["no lowercase", "UPPERCASE1!", "lowercase"],
    ["no number", "NoNumbers!!", "number"],
    ["no special character", "NoSpecial123", "special character"],
  ];
  for (const [name, password, hint] of weakPasswords) {
    test(`API-AUTH-03 weak password rejected: ${name}`, async ({ request }) => {
      const res = await new JobTrackApi(request).register(uniqueEmail(), password);
      await expectStatus(res, 400);
      if (name !== "short") expect(await errorMessage(res)).toContain(hint);
    });
  }

  test("API-AUTH-04 invalid email format is rejected", async ({ request }) => {
    const res = await new JobTrackApi(request).register("not-an-email", VALID_PASSWORD);
    await expectStatus(res, 400);
  });

  test("API-AUTH-05 login with valid credentials returns tokens", async ({ request }) => {
    const api = new JobTrackApi(request);
    const { email } = await api.createUser();
    const res = await api.login(email, VALID_PASSWORD);
    await expectStatus(res, 200);
    expect((await res.json()).tokens.accessToken).toBeTruthy();
  });

  test("API-AUTH-06 login with wrong password returns 401", async ({ request }) => {
    const api = new JobTrackApi(request);
    const { email } = await api.createUser();
    const res = await api.login(email, "Wr0ng!Password");
    await expectStatus(res, 401);
    expect(await errorMessage(res)).toBe("Invalid email or password.");
  });

  test("API-AUTH-07 login with unknown email returns the same generic 401", async ({ request }) => {
    const res = await new JobTrackApi(request).login(uniqueEmail("ghost"), VALID_PASSWORD);
    await expectStatus(res, 401);
    expect(await errorMessage(res)).toBe("Invalid email or password."); // no user enumeration
  });

  test("API-AUTH-08 refresh token issues a new token pair and rotates the old one", async ({ request }) => {
    const api = new JobTrackApi(request);
    const { tokens } = await api.createUser();
    const res = await api.post("/auth/refresh", { refreshToken: tokens.refreshToken }, null);
    await expectStatus(res, 200);
    const refreshed = (await res.json()).tokens;
    expect(refreshed.refreshToken).not.toBe(tokens.refreshToken);
    // the old refresh token has been rotated out
    await expectStatus(await api.post("/auth/refresh", { refreshToken: tokens.refreshToken }, null), 401);
  });

  test("API-AUTH-09 logout revokes the refresh token", async ({ request }) => {
    const api = new JobTrackApi(request);
    const { tokens } = await api.createUser();
    await expectStatus(await api.post("/auth/logout"), 204);
    await expectStatus(await api.post("/auth/refresh", { refreshToken: tokens.refreshToken }, null), 401);
  });

  test("API-AUTH-10 protected endpoints reject missing or tampered tokens", async ({ request }) => {
    const api = new JobTrackApi(request);
    const { tokens } = await api.createUser();
    await expectStatus(await api.get("/job-applications", null), 401);
    const tampered = tokens.accessToken.slice(0, -4) + "abcd";
    await expectStatus(await api.get("/job-applications", tampered), 401);
  });
});
