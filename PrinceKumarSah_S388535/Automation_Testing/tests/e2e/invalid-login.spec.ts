import { test, expect } from '@playwright/test';

test('TC-004 - Invalid Login', async ({ page }) => {
  await page.goto('/login');

  // Enter valid email with an incorrect password
  await page.locator('input[name="email"]').fill(process.env.TEST_EMAIL || '');
  await page.locator('input[name="password"]').fill('WrongPassword123!');

  // Click Sign in
  await page.getByRole('button', { name: /sign in/i }).click();

  // Verify login is rejected
  await expect(page).toHaveURL(/login/);

  // Verify the login page is still displayed
  await expect(
    page.getByRole('button', { name: /sign in/i })
  ).toBeVisible();
});