# End-to-End Testing with Playwright

This directory contains end-to-end (E2E) tests for the Aegrid Asset Lifecycle Intelligence Platform using [Playwright](https://playwright.dev/).

## Overview

The E2E tests are designed to verify the core functionality of Aegrid, ensuring that:

1. **Authentication and Security** - User authentication, role-based access control, and security measures work correctly
2. **Aegrid Rules Compliance** - The four core Aegrid Rules are properly implemented:
   - Every Asset Has a Purpose → Function-based anchoring
   - Match Maintenance to Risk → Criticality-driven grouping
   - Protect the Critical Few → Visibility of crown jewels
   - Plan for Tomorrow, Today → Flexible, future-proof models
3. **User Experience** - Navigation, responsive design, and accessibility standards are met
4. **Performance** - The application loads and performs within acceptable parameters

## Test Structure

### Core Test Files

- **`example.spec.ts`** - Basic functionality tests and setup verification
- **`auth-flow.spec.ts`** - Comprehensive authentication and RBAC testing
- **`aegrid-core.spec.ts`** - Core Aegrid functionality and rules compliance testing

### Test Categories

#### Authentication Tests (`auth-flow.spec.ts`)
- Login form validation
- Email format validation
- Password requirements
- Successful login flow
- Invalid credential handling
- Protected route access
- Logout functionality
- Role-based access control

#### Core Functionality Tests (`aegrid-core.spec.ts`)
- Function-based asset organization
- Risk-based asset grouping
- Critical asset visibility
- Multiple organizational views
- Asset lifecycle information
- Maintenance planning by risk
- Asset intelligence insights
- Mobile responsiveness
- Offline functionality
- Accessibility compliance
- Performance testing

## Running Tests

### Prerequisites

1. Ensure the development server is running:
   ```bash
   npm run dev
   ```

2. Make sure test data is seeded in the database:
   ```bash
   npm run db:seed
   ```

### Test Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in headed mode (visible browser)
npm run test:e2e:headed

# Run tests with UI mode (interactive)
npm run test:e2e:ui

# Debug tests step by step
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

### Running Specific Tests

```bash
# Run a specific test file
npx playwright test e2e/auth-flow.spec.ts

# Run tests matching a pattern
npx playwright test --grep "authentication"

# Run tests in a specific browser
npx playwright test --project=chromium
```

## Configuration

### Playwright Configuration (`playwright.config.ts`)

The configuration includes:

- **Test Directory**: `./e2e`
- **Base URL**: `http://localhost:3000` (configurable via `PLAYWRIGHT_BASE_URL` env var)
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Parallel Execution**: Enabled for faster test runs
- **Retries**: 2 retries on CI, 0 locally
- **Reporters**: HTML reporter with trace collection
- **Web Server**: Automatically starts dev server before tests

### Environment Variables

```bash
# Optional: Override base URL for tests
PLAYWRIGHT_BASE_URL=http://localhost:3000

# CI environment detection
CI=true  # Enables retries and single worker
```

## Test Data Requirements

The tests assume the following test users exist in the database:

- `admin@aegrid.com` - Admin user with full access
- `manager@aegrid.com` - Manager user
- `supervisor@aegrid.com` - Supervisor user
- `crew@aegrid.com` - Crew user
- `exec@aegrid.com` - Executive user
- `citizen@aegrid.com` - Citizen user (read-only)

Default password for all test users: `password123`

## CI/CD Integration

### GitHub Actions

The `.github/workflows/playwright.yml` workflow:

- Runs on pushes to `main` and `develop` branches
- Runs on pull requests targeting `main` and `develop`
- Installs dependencies and Playwright browsers
- Executes all E2E tests
- Uploads test reports as artifacts

### Local CI Simulation

```bash
# Run tests as they would run in CI
CI=true npm run test:e2e
```

## Best Practices

### Writing Tests

1. **Use Descriptive Names** - Test names should clearly describe what is being tested
2. **Follow AAA Pattern** - Arrange, Act, Assert
3. **Use Data Attributes** - Prefer `data-testid` over CSS selectors for stability
4. **Wait for Elements** - Use Playwright's auto-waiting features
5. **Handle Async Operations** - Properly await all async operations

### Example Test Structure

```typescript
test('should perform specific action', async ({ page }) => {
  // Arrange - Set up test conditions
  await page.goto('/specific-page');
  await page.locator('[data-testid="input"]').fill('test value');

  // Act - Perform the action
  await page.locator('[data-testid="submit"]').click();

  // Assert - Verify the result
  await expect(page.locator('[data-testid="result"]')).toBeVisible();
});
```

### Debugging Tests

1. **Use UI Mode** - `npm run test:e2e:ui` for interactive debugging
2. **Add Screenshots** - Tests automatically capture screenshots on failure
3. **Use Trace Viewer** - `npx playwright show-trace trace.zip` for detailed debugging
4. **Add Console Logs** - Use `page.on('console', msg => console.log(msg.text()))`

## Troubleshooting

### Common Issues

1. **Tests Timeout** - Increase timeout in `playwright.config.ts` or add `test.setTimeout()`
2. **Element Not Found** - Check if element exists and is visible, use proper selectors
3. **Authentication Issues** - Verify test users exist and credentials are correct
4. **Flaky Tests** - Add proper waits, avoid hard-coded delays

### Debug Commands

```bash
# Run with debug output
DEBUG=pw:api npm run test:e2e

# Run single test with trace
npx playwright test auth-flow.spec.ts --trace=on

# Generate test code
npx playwright codegen localhost:3000
```

## Contributing

When adding new E2E tests:

1. Follow the existing test structure and naming conventions
2. Ensure tests are independent and can run in any order
3. Add appropriate test data requirements to this README
4. Update the CI workflow if new environment setup is needed
5. Test both positive and negative scenarios
6. Include accessibility and mobile responsiveness checks

## Resources

- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright API Reference](https://playwright.dev/docs/api/class-playwright)
- [Aegrid Rules Documentation](../../docs/core/aegrid-rules.md)
