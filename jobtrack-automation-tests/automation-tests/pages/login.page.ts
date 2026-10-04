import { expect, Locator, Page } from "@playwright/test";

export class LoginPage {
  readonly email: Locator;
  readonly password: Locator;
  readonly signInButton: Locator;
  readonly registerEmail: Locator;
  readonly registerPassword: Locator;
  readonly createAccountButton: Locator;

  constructor(private readonly page: Page) {
    this.email = page.locator("#email");
    this.password = page.locator("#password");
    this.signInButton = page.getByRole("button", { name: "Sign in", exact: true });
    this.registerEmail = page.locator("#register-email");
    this.registerPassword = page.locator("#register-password");
    this.createAccountButton = page.getByRole("button", { name: "Create account", exact: true });
  }

  async goto() {
    await this.page.goto("/login");
    await expect(this.page.getByRole("heading", { name: "Sign in to JobTrack" })).toBeVisible();
  }

  async login(email: string, password: string) {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.signInButton.click();
  }

  async openRegister() {
    await this.page.getByRole("button", { name: "Create an account" }).click();
    await expect(this.page.getByRole("heading", { name: "Create your account" })).toBeVisible();
  }

  async register(email: string, password: string) {
    await this.registerEmail.fill(email);
    await this.registerPassword.fill(password);
    await this.createAccountButton.click();
  }

  /** Red inline messages under fields and the API error box. */
  errorText(text: string | RegExp) {
    return this.page.locator("p.text-red-600", { hasText: text });
  }
}
