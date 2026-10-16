import { test, expect } from '@playwright/test';

test('Update Application Status - Applied to Interview', async ({ page }) => {
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

  const companyName = `Automation Company ${Date.now()}`;
  const roleTitle = 'Automation Test Engineer';

  await page.getByLabel('Company name').fill(companyName);
  await page.getByLabel('Role title').fill(roleTitle);
  await page.getByLabel('Platform').fill('LinkedIn');

  await page.getByRole('button', { name: 'Create job application' }).click();

  // Go explicitly to the Job Application list
  await page.getByRole('link', { name: 'Job application' }).click();

  // Wait for the new application to appear
  await expect(
    page.getByText(companyName, { exact: true })
  ).toBeVisible({ timeout: 10000 });

  // Open the newly created application
  await page.getByText(companyName, { exact: true }).click();

   // Move Applied → Interview
  await page.getByRole('button', { name: 'Move to Interview' }).click();

  // Confirm the status change
  await page.getByRole('button', { name: 'Move to Interview' }).click();

  // Verify Interview status
  await expect(
    page.getByText('Interview', { exact: true }).first()
  ).toBeVisible();
});