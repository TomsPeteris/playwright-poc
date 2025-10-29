import { Locator, Page, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly banner: Locator;
  readonly loginForm: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;
  readonly forgotPasswordButton: Locator;
  readonly forgotPasswordModal: Locator;
  readonly forgotPasswordInput: Locator;
  readonly forgotPasswordSubmit: Locator;

  constructor(page: Page) {
    this.page = page;
    this.banner = page.locator('cx-banner');
    this.loginForm = page.locator('cw-login-form');
    this.usernameInput = this.loginForm.locator('input[formcontrolname="userId"]');
    this.passwordInput = this.loginForm.locator('input[formcontrolname="password"]');
    this.loginButton = this.loginForm.locator('button[type="submit"]');
    this.errorMessage = page.locator('.alert-danger');
    this.successMessage = page.locator('.alert-success');
    this.forgotPasswordButton = page.locator('cw-forgot-password-button button[type="button"]');
    this.forgotPasswordModal = page.locator('cw-forgot-password-dialog');
    this.forgotPasswordInput = page.locator('input[formcontrolname="userEmail"]');
    this.forgotPasswordSubmit = page.locator('button:has-text("Reset")');
  }

  async goto() {
    await this.page.goto('/login');
    // Wait for login form to be fully loaded with inputs visible
    await this.usernameInput.waitFor({ state: 'visible' });
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectLoginFormVisible() {
    await expect(this.loginForm).toBeVisible();
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
  }

  async expectErrorMessage(message: RegExp | string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }

  async expectSuccessMessage(message: RegExp | string) {
    await expect(this.successMessage).toBeVisible();
    await expect(this.successMessage).toContainText(message);
  }

  async expectForgotPasswordButtonVisible() {
    await expect(this.forgotPasswordButton).toBeVisible();
  }

  async expectForgotPasswordModalVisible() {
    await expect(this.forgotPasswordModal).toBeVisible();
  }
}
