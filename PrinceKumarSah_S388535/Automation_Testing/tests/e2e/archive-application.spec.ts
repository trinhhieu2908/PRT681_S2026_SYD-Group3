import { test, expect } from '@playwright/test';

test('Archive Job Application', async ({ page }) => {
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

  // Create a fresh application
  await page.getByRole('button', { name: /add opportunity/i }).click();

  const companyName = `Archive Test Company ${Date.now()}`;
  const roleTitle = 'Archive Test Engineer';

  await page.getByLabel('Company name').fill(companyName);
  await page.getByLabel('Role title').fill(roleTitle);
  await page.getByLabel('Platform').fill('LinkedIn');

  await page.getByRole('button', { name: 'Create job application' }).click();

  // Open Job Applications
  await page.getByRole('link', { name: 'Job application' }).click();

  // Open the new application
  await expect(
    page.getByText(companyName, { exact: true })
  ).toBeVisible({ timeout: 10000 });

  await page.getByText(companyName, { exact: true }).click();

  // Applied → Interview
  await page.getByRole('button', { name: 'Move to Interview' }).click();
  await page.getByRole('button', { name: 'Move to Interview' }).click();

  // Interview → Offer
  await page.getByRole('button', { name: /Record an offer/i }).click();
  await page.getByRole('button', { name: 'Move to Offer' }).click();

  // Archive the application
  await page.getByRole('button', { name: /Archive application/i }).click();

  // Confirm archive
  await page.getByRole('button', { name: 'Archive' }).click();

  // Verify Archived status
  await expect(
    page.getByText('Archived', { exact: true }).first()
  ).toBeVisible();
});