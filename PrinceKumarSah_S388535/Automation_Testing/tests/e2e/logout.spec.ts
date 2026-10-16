import { test, expect } from '@playwright/test';

test('Logout', async ({ page }) => {
  // Login
  await page.goto('/login');

  await page.locator('input[name="email"]').fill(process.env.TEST_EMAIL || '');
  await page.locator('input[name="password"]').fill(process.env.TEST_PASSWORD || '');
  await page.getByRole('button', { name: /sign in/i }).click();

  // Verify logged-in dashboard
  await expect(page).toHaveURL('http://localhost:5173/');
  await expect(
    page.getByRole('banner').getByText('Dashboard', { exact: true })
  ).toBeVisible();

  // Click Sign Out
  await page.getByRole('button', { name: 'Sign Out' }).click();

  // Confirm logout
  await page.getByRole('button', { name: 'Logout' }).click();

  // Verify user is logged out
  await expect(page).toHaveURL(/login/);

  // Verify Sign In button is displayed
  await expect(
    page.getByRole('button', { name: /sign in/i })
  ).toBeVisible();

  // Verify protected page cannot be accessed
  await page.goto('/job-applications');

  await expect(page).not.toHaveURL(/job-applications/);
});