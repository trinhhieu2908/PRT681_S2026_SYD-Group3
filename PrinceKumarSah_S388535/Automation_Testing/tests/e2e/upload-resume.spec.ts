import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('Upload Resume Document', async ({ page }) => {
  const sourceFile =
    'C:\\Users\\ps749\\Downloads\\Tax Invoice - Blank Template.docx (1).pdf';

  // Create a unique copy so the application does not reject
  // the file because the filename already exists.
  const uniqueFileName = `Automation Resume ${Date.now()}.pdf`;
  const uniqueFilePath = path.join(
    'C:\\Users\\ps749\\Downloads',
    uniqueFileName
  );

  fs.copyFileSync(sourceFile, uniqueFilePath);

  try {
    // Login
    await page.goto('/login');

    await page
      .locator('input[name="email"]')
      .fill(process.env.TEST_EMAIL || '');

    await page
      .locator('input[name="password"]')
      .fill(process.env.TEST_PASSWORD || '');

    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL('http://localhost:5173/');

    // Create a fresh application
    const companyName = `Upload Company ${Date.now()}`;
    const roleTitle = `Upload Engineer ${Date.now()}`;

    await page
      .getByRole('button', { name: /add opportunity/i })
      .click();

    await page
      .getByLabel('Company name')
      .fill(companyName);

    await page
      .getByLabel('Role title')
      .fill(roleTitle);

    await page
      .getByLabel('Platform')
      .fill('LinkedIn');

    await page
      .getByRole('button', {
        name: 'Create job application'
      })
      .click();

    // Go to Job applications
    await page
      .getByRole('link', { name: 'Job application' })
      .click();

    // Open our newly-created application
    await page
      .getByRole('link', {
        name: new RegExp(
          `View ${roleTitle} at ${companyName}`,
          'i'
        )
      })
      .click();

    await expect(
      page.getByText('Application details', { exact: true })
    ).toBeVisible();

   // Upload the unique resume
await page
  .getByRole('button', { name: /upload resume/i })
  .click();

const fileInput = page.locator(
  'input[type="file"][aria-label="Choose one resume to upload"]'
);

await fileInput.setInputFiles(uniqueFilePath);

    // If an upload button is required, click it.
    const uploadButton = page.getByRole('button', {
      name: /upload resume/i
    });

    if (await uploadButton.isVisible()) {
      await uploadButton.click();
    }

    // Verify the resume was successfully recorded.
    await expect(
      page.getByText('Recorded', { exact: true }).first()
    ).toBeVisible({
      timeout: 15000
    });
  } finally {
    // Delete the temporary local copy after the test.
    if (fs.existsSync(uniqueFilePath)) {
      fs.unlinkSync(uniqueFilePath);
    }
  }
});