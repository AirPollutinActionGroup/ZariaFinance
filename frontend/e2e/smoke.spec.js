import { expect, test } from '@playwright/test';

test.describe('application shell', () => {
  test('unauthenticated users land on sign-in', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  });

  test('review mode opens the dashboard shell', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /continue in review mode/i }).click();
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByText('Review mode — backend sign-in pending')).toBeVisible();
    await expect(page.getByText('Zariya')).toBeVisible();
  });

  test('registration form validates before submission', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('button', { name: /submit request/i }).click();
    await expect(page.getByText('First name is required')).toBeVisible();
    await expect(page.getByText('Invalid mobile number')).toBeVisible();
  });
});
