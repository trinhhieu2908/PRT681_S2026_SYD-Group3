import { test, expect } from '@playwright/test';

test('TC-003 - Valid Login', async ({ page }) => {
  await page.goto('/login');

  // Enter valid credentials
  await page.locator('input[name="email"]').fill(process.env.TEST_EMAIL || '');
  await page.locator('input[name="password"]').fill(process.env.TEST_PASSWORD || '');

  // Click Sign in
  await page.getByRole('button', { name: /sign in/i }).click();

  // Verify successful login
  await expect(page).toHaveURL('http://localhost:5173/');

  // Verify dashboard heading
  await expect(
    page.getByRole('banner').getByText('Dashboard', { exact: true })
  ).toBeVisible();
});