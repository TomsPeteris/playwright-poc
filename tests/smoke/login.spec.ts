import { expect, test } from '../../fixtures/custom-fixtures';
import { testUsers } from '../../fixtures/test-data';

test.describe('Login Page - Smoke Tests', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('should display login page with all required elements', async ({ page, loginPage }) => {
    await expect(page).toHaveTitle('Login');
    await expect(loginPage.banner).toBeVisible();
    await loginPage.expectLoginFormVisible();
  });

  test('should login successfully with valid credentials', async ({ page, loginPage }) => {
    await loginPage.login(testUsers.validUser.username, testUsers.validUser.password);
    
    // Wait for navigation to complete
    await page.waitForURL(/\/cwa\/en\/USD\/?$/);
    await expect(page).toHaveTitle('Homepage');
  });

  test('should show error message with invalid credentials', async ({ page, loginPage }) => {
    await loginPage.login(testUsers.invalidUser.username, testUsers.invalidUser.password);
    
    await expect(page).toHaveURL(/\/login/);
    await loginPage.expectErrorMessage(/bad credentials/i);
  });
});
