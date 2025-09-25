import { expect, test } from '@playwright/test';

/**
 * Aegrid Core Functionality Tests
 *
 * These tests verify the core features of the Asset Lifecycle Intelligence Platform
 * following The Aegrid Rules:
 * 1. Every Asset Has a Purpose → Function-based anchoring
 * 2. Match Maintenance to Risk → Criticality-driven grouping
 * 3. Protect the Critical Few → Visibility of crown jewels
 * 4. Plan for Tomorrow, Today → Flexible, future-proof models
 *
 * @see https://playwright.dev/docs/writing-tests
 */
test.describe('Aegrid Core Functionality', () => {

  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await page.goto('/auth/login');
    await page.locator('input[type="email"]').fill('admin@aegrid.com');
    await page.locator('input[type="password"]').fill('admin123');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should display asset dashboard with function-based organization', async ({ page }) => {
    // Navigate to assets page
    await page.goto('/assets');

    // Verify function-based organization is displayed
    await expect(page.locator('text=Function-Based Organization')).toBeVisible();

    // Check for service purpose categories
    await expect(page.locator('text=Transportation')).toBeVisible();
    await expect(page.locator('text=Mowing')).toBeVisible();
    await expect(page.locator('text=Lifting')).toBeVisible();

    // Verify no "miscellaneous" or "other" categories
    await expect(page.locator('text=Miscellaneous')).not.toBeVisible();
    await expect(page.locator('text=Other')).not.toBeVisible();
  });

  test('should group assets by risk and criticality', async ({ page }) => {
    await page.goto('/assets');

    // Verify risk-based grouping
    await expect(page.locator('text=High Risk Assets')).toBeVisible();
    await expect(page.locator('text=Medium Risk Assets')).toBeVisible();
    await expect(page.locator('text=Low Risk Assets')).toBeVisible();

    // Check for criticality indicators
    await expect(page.locator('text=Critical Assets')).toBeVisible();
    await expect(page.locator('[data-testid="critical-asset-indicator"]')).toBeVisible();
  });

  test('should highlight critical assets prominently', async ({ page }) => {
    await page.goto('/dashboard');

    // Critical assets should be prominently displayed
    await expect(page.locator('[data-testid="critical-assets-widget"]')).toBeVisible();

    // Should show critical asset count
    await expect(page.locator('text=Critical Assets')).toBeVisible();

    // Critical assets should have special styling
    await expect(page.locator('.critical-asset')).toBeVisible();
  });

  test('should support multiple organizational views', async ({ page }) => {
    await page.goto('/assets');

    // Verify view switching capability
    await expect(page.locator('button:has-text("Operational View")')).toBeVisible();
    await expect(page.locator('button:has-text("Financial View")')).toBeVisible();
    await expect(page.locator('button:has-text("Compliance View")')).toBeVisible();

    // Test switching to financial view
    await page.locator('button:has-text("Financial View")').click();
    await expect(page.locator('text=Asset Value')).toBeVisible();

    // Test switching to compliance view
    await page.locator('button:has-text("Compliance View")').click();
    await expect(page.locator('text=Compliance Status')).toBeVisible();
  });

  test('should display asset lifecycle information', async ({ page }) => {
    await page.goto('/assets');

    // Click on an asset to view details
    await page.locator('[data-testid="asset-card"]').first().click();

    // Verify lifecycle information is displayed
    await expect(page.locator('text=Asset Lifecycle')).toBeVisible();
    await expect(page.locator('text=Current Phase')).toBeVisible();
    await expect(page.locator('text=Next Maintenance')).toBeVisible();
    await expect(page.locator('text=Service Purpose')).toBeVisible();
  });

  test('should support maintenance planning by risk', async ({ page }) => {
    await page.goto('/maintenance');

    // Verify maintenance planning interface
    await expect(page.locator('text=Maintenance Planning')).toBeVisible();

    // Check for risk-based maintenance scheduling
    await expect(page.locator('text=High Priority Maintenance')).toBeVisible();
    await expect(page.locator('text=Risk-Based Schedule')).toBeVisible();

    // Verify maintenance frequency is based on criticality
    await expect(page.locator('text=Quarterly Inspection')).toBeVisible();
    await expect(page.locator('text=Run-to-Fail')).toBeVisible();
  });

  test('should provide asset intelligence insights', async ({ page }) => {
    await page.goto('/asset-intelligence');

    // Verify intelligence dashboard
    await expect(page.locator('text=Asset Intelligence')).toBeVisible();

    // Check for key insights
    await expect(page.locator('text=Performance Metrics')).toBeVisible();
    await expect(page.locator('text=Failure Predictions')).toBeVisible();
    await expect(page.locator('text=Optimisation Recommendations')).toBeVisible();
  });

  test('should support mobile responsive design', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/dashboard');

    // Verify mobile navigation
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();

    // Check if content is accessible on mobile
    await expect(page.locator('text=Critical Assets')).toBeVisible();

    // Verify no horizontal scrolling
    const body = page.locator('body');
    const boundingBox = await body.boundingBox();
    expect(boundingBox?.width).toBeLessThanOrEqual(375);
  });

  test('should handle offline functionality', async ({ page }) => {
    // Simulate offline mode
    await page.context().setOffline(true);

    await page.goto('/dashboard');

    // Should show offline indicator
    await expect(page.locator('text=Offline Mode')).toBeVisible();

    // Should still show cached critical asset information
    await expect(page.locator('text=Critical Assets')).toBeVisible();
  });

  test('should support accessibility standards', async ({ page }) => {
    await page.goto('/dashboard');

    // Verify ARIA labels are present
    await expect(page.locator('[aria-label]')).toBeVisible();

    // Check for proper heading structure
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h2')).toBeVisible();

    // Verify keyboard navigation works
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
  });
});

/**
 * Performance and Load Tests
 *
 * These tests verify that the application performs well
 * under various load conditions.
 */
test.describe('Performance Tests', () => {

  test('should load dashboard within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/dashboard');
    await expect(page.locator('text=Critical Assets')).toBeVisible();

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
  });

  test('should handle large asset datasets efficiently', async ({ page }) => {
    await page.goto('/assets');

    // Verify pagination or virtual scrolling is implemented
    await expect(page.locator('[data-testid="asset-list"]')).toBeVisible();

    // Check that only visible assets are rendered
    const assetCards = page.locator('[data-testid="asset-card"]');
    const visibleCount = await assetCards.count();
    expect(visibleCount).toBeLessThanOrEqual(20); // Reasonable initial load
  });
});
