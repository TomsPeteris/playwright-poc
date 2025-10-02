import { expect, test } from '@playwright/test';

test.describe('Login Page - Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    // Wait for login form to be visible
    await page.locator('cw-login-form').waitFor({ state: 'visible' });
  });

  test('should match login page screenshot', async ({ page }) => {
    // Take a screenshot and compare with baseline
    await expect(page).toHaveScreenshot('login-page-full.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match login form screenshot', async ({ page }) => {
    const loginForm = page.locator('cw-login-form');
    await loginForm.waitFor({ state: 'visible' });
    
    // Take a screenshot of just the login form
    await expect(loginForm).toHaveScreenshot('login-form.png', {
      animations: 'disabled',
    });
  });

  test('should match login page banner', async ({ page }) => {
    const banner = page.locator('cx-banner');
    await banner.waitFor({ state: 'visible' });
    
    // Screenshot of the banner
    await expect(banner).toHaveScreenshot('login-banner.png', {
      animations: 'disabled',
    });
  });

  test('should match login button state', async ({ page }) => {
    const loginButton = page.locator('cw-login-form button[type="submit"]');
    await loginButton.waitFor({ state: 'visible' });
    
    // Screenshot of the login button
    await expect(loginButton).toHaveScreenshot('login-button.png', {
      animations: 'disabled',
    });
  });

  test('should match login page on different viewport sizes', async ({ page }) => {
    // Desktop view
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page).toHaveScreenshot('login-page-desktop.png', {
      fullPage: true,
      animations: 'disabled',
    });

    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page).toHaveScreenshot('login-page-tablet.png', {
      fullPage: true,
      animations: 'disabled',
    });

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page).toHaveScreenshot('login-page-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match login page with error state', async ({ page }) => {
    // Fill in invalid credentials
    await page.locator('input[formcontrolname="userId"]').fill('invalid@test.com');
    await page.locator('input[formcontrolname="password"]').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();
    
    // Wait for error message
    const errorMessage = page.locator('.alert-danger');
    await errorMessage.waitFor({ state: 'visible', timeout: 10000 });
    
    // Screenshot with error message
    await expect(page).toHaveScreenshot('login-page-with-error.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match login page with filled inputs', async ({ page }) => {
    // Fill in the form
    await page.locator('input[formcontrolname="userId"]').fill('test@example.com');
    await page.locator('input[formcontrolname="password"]').fill('password123');
    
    // Screenshot with filled inputs
    const loginForm = page.locator('cw-login-form');
    await expect(loginForm).toHaveScreenshot('login-form-filled.png', {
      animations: 'disabled',
    });
  });

  test('should match login page with masked threshold', async ({ page }) => {
    // Use threshold for slight variations (useful for dynamic content)
    await expect(page).toHaveScreenshot('login-page-threshold.png', {
      fullPage: true,
      animations: 'disabled',
      maxDiffPixels: 100, // Allow up to 100 pixels difference
    });
  });
});
