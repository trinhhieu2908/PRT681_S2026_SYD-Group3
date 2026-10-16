import { test, expect } from '@playwright/test';

test('Invalid Status Transition - Interview to Applied', async ({ page }) => {
  // Login
  await page.goto('/login');

  await page.locator('input[name="email"]').fill(process.env.TEST_EMAIL || '');
  await page.locator('input[name="password"]').fill(process.env.TEST_PASSWORD || '');
  await page.getByRole('button', { name: /sign in/i }).click();

  // Verify dashboard
  await expect(page).toHaveURL('http://localhost:5173/');
  await expect(
    page.getByRole('banner').getByText('Dashboard', { exact: true })
  ).toBeVisible();

  // Open Job applications
  await page.getByRole('link', { name: 'Job application' }).click();

 // Find the application currently in Interview
await page
  .getByRole('link', { name: /View Automation Test Engineer at Automation Company/ })
  .filter({ hasText: 'Interview' })
  .first()
  .click();

// Verify current stage is Interview
await expect(
  page.getByText('Interview', { exact: true }).first()
).toBeVisible();

// Verify invalid Interview → Applied transition is NOT available
await expect(
  page.getByRole('button', { name: /Move to Applied/i })
).not.toBeVisible();
});