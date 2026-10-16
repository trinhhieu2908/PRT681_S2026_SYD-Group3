import { test as base, expect, Page } from "@playwright/test";
import { JobTrackApi, Session } from "./utils/api-client";

type Fixtures = {
  /** API client logged in as a freshly registered user. */
  api: JobTrackApi;
  /** A browser page already signed in as the same user as `api`. */
  authedPage: Page;
};

export const test = base.extend<Fixtures>({
  api: async ({ request }, use) => {
    const api = new JobTrackApi(request);
    await api.createUser();
    await use(api);
  },
  authedPage: async ({ page, api }, use) => {
    await signInWithTokens(page, api.session!);
    await use(page);
  },
});

/**
 * Puts the session tokens into localStorage (same keys the frontend uses) before any
 * page script runs. Much faster than logging in through the UI in every test; the
 * login form itself is covered by tests/ui/auth.spec.ts.
 */
export async function signInWithTokens(page: Page, session: Session) {
  await page.addInitScript((tokens) => {
    // Seed only once per tab so a later sign-out is not undone by the next navigation.
    if (sessionStorage.getItem("__jobtrack_seeded")) return;
    sessionStorage.setItem("__jobtrack_seeded", "1");
    localStorage.setItem("access_token", tokens.accessToken);
    localStorage.setItem("refresh_token", tokens.refreshToken);
    localStorage.setItem("refresh_token_expires_at", tokens.refreshTokenExpiresAtUtc);
  }, session.tokens);
}

export { expect };
