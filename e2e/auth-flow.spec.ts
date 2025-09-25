import { expect, test } from '@playwright/test';

/**
 * Authentication Flow Tests for Aegrid
 *
 * These tests verify the authentication functionality following
 * the security standards and Aegrid Rules.
 *
 * @see https://playwright.dev/docs/writing-tests
 */
test.describe('Authentication Flow', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto('/auth/login');
  });

  test('should display login form with required fields', async ({ page }) => {
    // Verify login form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Verify form labels
    await expect(page.locator('label')).toContainText(['Email', 'Password']);
  });

  test('should validate email format', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    // Enter invalid email
    await emailInput.fill('invalid-email');
    await passwordInput.fill('password123');

    // Attempt to submit
    await submitButton.click();

    // Should show validation error
    await expect(page.locator('text=Invalid email')).toBeVisible();
  });

  test('should require password', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const submitButton = page.locator('button[type="submit"]');

    // Enter email but no password
    await emailInput.fill('test@example.com');

    // Attempt to submit
    await submitButton.click();

    // Should show validation error
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should redirect to dashboard on successful login', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    // Enter valid credentials (assuming test user exists)
    await emailInput.fill('admin@aegrid.com');
    await passwordInput.fill('admin123');

    // Submit form
    await submitButton.click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    // Enter invalid credentials
    await emailInput.fill('invalid@example.com');
    await passwordInput.fill('wrongpassword');

    // Submit form
    await submitButton.click();

    // Should show error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should redirect to login when accessing protected routes', async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/.*auth\/login/);
  });

  test('should handle logout functionality', async ({ page }) => {
    // First login (assuming test user exists)
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await emailInput.fill('admin@aegrid.com');
    await passwordInput.fill('admin123');
    await submitButton.click();

    // Wait for redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // Find and click logout button
    await page.locator('button:has-text("Logout")').click();

    // Should redirect back to login
    await expect(page).toHaveURL(/.*auth\/login/);
  });
});

/**
 * Role-Based Access Control Tests
 *
 * These tests verify that users can only access resources
 * appropriate to their role level.
 */
test.describe('Role-Based Access Control', () => {

  test('should restrict access based on user role', async ({ page }) => {
    // Test with different user roles
    const roles = ['ADMIN', 'MANAGER', 'SUPERVISOR', 'CREW', 'EXEC', 'CITIZEN'];

    for (const role of roles) {
      // Login with specific role (assuming test users exist)
      await page.goto('/auth/login');

      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');
      const submitButton = page.locator('button[type="submit"]');

      await emailInput.fill(`${role.toLowerCase()}@aegrid.com`);
      await passwordInput.fill('password123');
      await submitButton.click();

      // Verify access based on role
      if (role === 'ADMIN') {
        await expect(page.locator('text=Admin Panel')).toBeVisible();
      } else if (role === 'MANAGER') {
        await expect(page.locator('text=Manager Dashboard')).toBeVisible();
      } else if (role === 'CITIZEN') {
        await expect(page.locator('text=Citizen Portal')).toBeVisible();
      }

      // Logout for next iteration
      await page.locator('button:has-text("Logout")').click();
    }
  });
});
