import { expect, test } from '../../fixtures/custom-fixtures';

test.describe('Forgot Password - Smoke Tests', () => {

  test.describe.configure({ mode: 'serial' });
  
  const testEmail = 'ana.katja@yopmail.com';
  const newPassword = '1234';

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('should display login page with forgot password button', async ({ page, loginPage }) => {
    await expect(page).toHaveTitle('Login');
    await loginPage.expectForgotPasswordButtonVisible();
  });

  test('should open forgot password modal with input fields and button', async ({ page, loginPage }) => {
    await loginPage.forgotPasswordButton.click();
    await loginPage.expectForgotPasswordModalVisible();
    await expect(loginPage.forgotPasswordModal).toContainText('Password Reset Request');
    await expect(loginPage.forgotPasswordModal).toContainText('Please enter your email address below. You will receive a link to reset your password');
    await expect(loginPage.forgotPasswordInput).toBeVisible();
    await expect(loginPage.forgotPasswordSubmit).toBeVisible();
  });


  test('should submit password reset', async ({ 
    loginPage, 
  }) => {
    // Step 1: Submit forgot password request
    await loginPage.forgotPasswordButton.click();
    await loginPage.expectForgotPasswordModalVisible();
    await loginPage.forgotPasswordInput.fill(testEmail);
    await loginPage.forgotPasswordSubmit.click();

    // Step 2: Verify success message
    await loginPage.expectSuccessMessage('Please check your email for a link to reset your password. The link will expire in 30 min');
  });
});