import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly banner: Locator;
  readonly loginForm: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.banner = page.locator('cx-banner');
    this.loginForm = page.locator('cw-login-form');
    this.usernameInput = this.loginForm.locator('input[formcontrolname="userId"]');
    this.passwordInput = this.loginForm.locator('input[formcontrolname="password"]');
    this.loginButton = this.loginForm.locator('button[type="submit"]');
    this.errorMessage = page.locator('.alert-danger');
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
}
