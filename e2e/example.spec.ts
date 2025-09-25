import { expect, test } from '@playwright/test';

/**
 * Example test for Aegrid - Asset Lifecycle Intelligence Platform
 *
 * This test demonstrates basic Playwright functionality and serves as a template
 * for end-to-end testing of the Aegrid application.
 *
 * @see https://playwright.dev/docs/writing-tests
 */
test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Aegrid|Aegrid/);
});

/**
 * Test authentication flow
 *
 * This test verifies the basic authentication functionality
 * following the Aegrid Rules and security standards.
 */
test('authentication flow', async ({ page }) => {
  await page.goto('/auth/login');

  // Check if login page loads
  await expect(page).toHaveURL(/.*auth\/login/);

  // Verify login form elements are present
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await expect(page.locator('input[type="password"]')).toBeVisible();
  await expect(page.locator('button[type="submit"]')).toBeVisible();
});

/**
 * Test navigation to protected routes
 *
 * This test ensures that unauthenticated users are redirected
 * to login when accessing protected routes.
 */
test('redirects to login for protected routes', async ({ page }) => {
  // Try to access a protected route
  await page.goto('/dashboard');

  // Should redirect to login
  await expect(page).toHaveURL(/.*auth\/login/);
});

/**
 * Test mobile responsiveness
 *
 * This test verifies that the application works correctly
 * on mobile devices, supporting the mobile-first approach.
 */
test('mobile responsive design', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });

  await page.goto('/');

  // Check if the page loads without horizontal scrolling
  const body = page.locator('body');
  const boundingBox = await body.boundingBox();
  expect(boundingBox?.width).toBeLessThanOrEqual(375);
});
