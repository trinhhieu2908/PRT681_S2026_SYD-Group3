import { test, expect } from '@playwright/test';

test('Search Job Applications', async ({ page }) => {
  // Login
  await page.goto('/login');

  await page.locator('input[name="email"]').fill(process.env.TEST_EMAIL || '');
  await page.locator('input[name="password"]').fill(process.env.TEST_PASSWORD || '');
  await page.getByRole('button', { name: /sign in/i }).click();

  await expect(page).toHaveURL('http://localhost:5173/');

  // Create unique application
  await page.getByRole('button', { name: /add opportunity/i }).click();

  const companyName = `Search Company ${Date.now()}`;
  const roleTitle = `Search Engineer ${Date.now()}`;

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

  // Search for the unique company
  const searchBox = page.getByRole('searchbox', {
    name: 'Search job applications by'
  });

  await searchBox.fill(companyName);
  await searchBox.press('Enter');

  // Verify search result
  await expect(
    page.getByText(companyName, { exact: true })
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page.getByText(roleTitle, { exact: true })
  ).toBeVisible();
});