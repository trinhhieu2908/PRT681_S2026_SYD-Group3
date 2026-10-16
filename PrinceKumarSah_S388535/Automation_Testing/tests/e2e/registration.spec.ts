import { test, expect } from '@playwright/test';

test('TC-001 - Valid Registration', async ({ page }) => {
  await page.goto('/login');

  // Open registration page
  await page.getByRole('button', { name: 'Create an account' }).click();

  // Generate a unique email for every test run
  const uniqueEmail = `jobtrack.test.${Date.now()}@example.com`;

  // Fill registration form
  await page.getByRole('textbox', { name: 'Email' }).fill(uniqueEmail);
  await page.getByRole('textbox', { name: 'Password' }).fill(
    process.env.TEST_PASSWORD || ''
  );

  // Submit registration
  await page.getByRole('button', { name: 'Create account' }).click();

  // Verify registration completed successfully
  await expect(page).toHaveURL(/login/);

  // Verify the login page is displayed
  await expect(
    page.getByRole('button', { name: /sign in/i })
  ).toBeVisible();
});