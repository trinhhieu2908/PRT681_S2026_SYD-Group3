import { test, expect } from '@playwright/test';

test('Filter Job Applications by Status', async ({ page }) => {
  // Login
  await page.goto('/login');

  await page.locator('input[name="email"]').fill(process.env.TEST_EMAIL || '');
  await page.locator('input[name="password"]').fill(process.env.TEST_PASSWORD || '');
  await page.getByRole('button', { name: /sign in/i }).click();

  await expect(page).toHaveURL('http://localhost:5173/');

  // Create a unique application
  await page.getByRole('button', { name: /add opportunity/i }).click();

  const companyName = `Filter Company ${Date.now()}`;
  const roleTitle = `Filter Engineer ${Date.now()}`;

  await page.getByLabel('Company name').fill(companyName);
  await page.getByLabel('Role title').fill(roleTitle);
  await page.getByLabel('Platform').fill('LinkedIn');

  await page.getByRole('button', {
    name: 'Create job application'
  }).click();

  // Open Job Applications
  await page.getByRole('link', {
    name: 'Job application'
  }).click();

 // Open Filters
await page.getByRole('button', { name: 'Filters' }).click();

// Open status selector
await page.locator('#job-application-status').click();

// Select Applied status
await page.getByRole('option', { name: 'Applied', exact: true }).click();

// Apply filters
await page.getByRole('button', { name: 'Apply filters' }).click();

// Verify our newly created application is displayed
await expect(
  page.getByText(companyName, { exact: true })
).toBeVisible({ timeout: 10000 });

// Verify Applied status
await expect(
  page.getByText('Applied', { exact: true }).first()
).toBeVisible();
});