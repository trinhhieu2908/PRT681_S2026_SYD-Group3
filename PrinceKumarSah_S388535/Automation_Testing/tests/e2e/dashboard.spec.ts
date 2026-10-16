import { test, expect } from '@playwright/test';

test('Dashboard Loading', async ({ page }) => {
  // Login
  await page.goto('/login');

  await page.locator('input[name="email"]').fill(process.env.TEST_EMAIL || '');
  await page.locator('input[name="password"]').fill(process.env.TEST_PASSWORD || '');
  await page.getByRole('button', { name: /sign in/i }).click();

  // Verify dashboard URL
  await expect(page).toHaveURL('http://localhost:5173/');

  // Verify Dashboard heading
  await expect(
    page.getByRole('banner').getByText('Dashboard', { exact: true })
  ).toBeVisible();

  // Verify main dashboard content
  await expect(page.getByText('Make the next', { exact: false })).toBeVisible();

  // Verify application pipeline section
  await expect(
    page.getByText('Applications by status', { exact: true })
  ).toBeVisible();
});