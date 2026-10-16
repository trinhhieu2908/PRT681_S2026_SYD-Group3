import { expect, test } from "@playwright/test";
import { JobTrackApi } from "../../utils/api-client";
import { uniqueEmail, VALID_PASSWORD } from "../../utils/test-data";
import { LoginPage } from "../../pages/login.page";

test.describe("UI — Login and registration", () => {
  test("UI-AUTH-01 unauthenticated user is redirected to the login page", async ({ page }) => {
    await page.goto("/job-applications");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Sign in to JobTrack" })).toBeVisible();
  });

  test("UI-AUTH-02 register a new account then sign in", async ({ page }) => {
    const login = new LoginPage(page);
    const email = uniqueEmail("ui");
    await login.goto();
    await login.openRegister();
    await login.register(email, VALID_PASSWORD);
    await expect(page.getByText("Account created. Please sign in.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Sign in to JobTrack" })).toBeVisible();

    await login.login(email, VALID_PASSWORD);
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: "Make the next move count." })).toBeVisible();
  });

  test("UI-AUTH-03 login with wrong password shows an error", async ({ page, request }) => {
    const { email } = await new JobTrackApi(request).createUser();
    const login = new LoginPage(page);
    await login.goto();
    await login.login(email, "Wr0ng!Password");
    await expect(login.errorText("Invalid email or password.")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("UI-AUTH-04 empty login form shows required-field messages", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.signInButton.click();
    await expect(login.errorText("Email is required")).toBeVisible();
    await expect(login.errorText("Password is required")).toBeVisible();
  });

  test("UI-AUTH-05 invalid email format is caught on the client", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login("not-an-email", "whatever");
    await expect(login.errorText("Enter a valid email address")).toBeVisible();
  });

  const weak: [string, string][] = [
    ["Ab1!", "at least 8 characters"],
    ["lowercase1!", "uppercase letter"],
    ["NoNumbers!!", "one number"],
    ["NoSpecial123", "special character"],
  ];
  for (const [password, message] of weak) {
    test(`UI-AUTH-06 register rejects weak password "${password}"`, async ({ page }) => {
      const login = new LoginPage(page);
      await login.goto();
      await login.openRegister();
      await login.register(uniqueEmail("ui"), password);
      await expect(login.errorText(message)).toBeVisible();
    });
  }

  test("UI-AUTH-07 registering an existing email shows the API error", async ({ page, request }) => {
    const { email } = await new JobTrackApi(request).createUser();
    const login = new LoginPage(page);
    await login.goto();
    await login.openRegister();
    await login.register(email, VALID_PASSWORD);
    await expect(login.errorText("The email address is already registered.")).toBeVisible();
  });

  test("UI-AUTH-08 password visibility toggle", async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.password.fill("Secret!123");
    await expect(login.password).toHaveAttribute("type", "password");
    await page.getByRole("button", { name: "Show password" }).click();
    await expect(login.password).toHaveAttribute("type", "text");
  });
});
