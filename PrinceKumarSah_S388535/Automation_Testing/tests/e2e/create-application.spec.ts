import { test, expect } from '@playwright/test';

test('Create Job Application', async ({ page }) => {
  await page.goto('/login');

  await page.locator('input[name="email"]').fill(process.env.TEST_EMAIL || '');
  await page.locator('input[name="password"]').fill(process.env.TEST_PASSWORD || '');
  await page.getByRole('button', { name: /sign in/i }).click();

  await expect(page).toHaveURL('http://localhost:5173/');

  await page.getByRole('button', { name: /add opportunity/i }).click();

  const companyName = `Automation Company ${Date.now()}`;
  const roleTitle = `Automation Engineer ${Date.now()}`;

  await page.getByLabel('Company name').fill(companyName);
  await page.getByLabel('Role title').fill(roleTitle);
  await page.getByLabel('Platform').fill('LinkedIn');

  await page.getByRole('button', {
    name: 'Create job application'
  }).click();

  await page.getByRole('link', {
    name: 'Job application'
  }).click();

  await expect(
    page.getByText(companyName, { exact: true })
  ).toBeVisible({ timeout: 10000 });

  await expect(
    page.getByText(roleTitle, { exact: true })
  ).toBeVisible();
});