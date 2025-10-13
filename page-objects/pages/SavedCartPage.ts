import { Locator, Page, expect } from '@playwright/test';

export class SavedCartPage {
  readonly page: Page;
  readonly savedCartsList: Locator;
  readonly savedCartItems: Locator;
  readonly createSavedCartButton: Locator;
  readonly savedCartNameInput: Locator;
  readonly saveButton: Locator;
  readonly restoreButton: Locator;
  readonly deleteButton: Locator;
  readonly savedCartLink: Locator;
  readonly savedCartMessage: Locator;
  readonly noSavedCartsMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.savedCartsList = page.locator('cw-saved-cart-list');
    this.savedCartItems = page.locator('cw-saved-cart-list tr, cw-saved-cart-list .table-mobile-row');
    this.createSavedCartButton = page.getByRole('button', { name: /save.*cart/i });
    this.savedCartNameInput = page.locator('input[name="name"], input[placeholder*="name"]');
    this.saveButton = page.getByRole('button', { name: /save/i });
    this.restoreButton = page.getByRole('button', { name: /restore/i });
    this.deleteButton = page.getByRole('button', { name: /delete/i });
    this.savedCartLink = page.getByRole('link', { name: /saved.*cart/i });
    this.savedCartMessage = page.locator('.alert, .message, .notification');
    this.noSavedCartsMessage = page.locator('.no-saved-carts, .empty-list');
  }

  async goto() {
    await this.page.goto('/my-account/saved-carts');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateToSavedCarts() {
    await this.savedCartLink.waitFor({ state: 'visible', timeout: 10000 });
    await this.savedCartLink.click();
    await this.page.waitForURL(/saved.*cart/);
  }

  async saveCurrentCart(cartName: string) {
    await this.createSavedCartButton.waitFor({ state: 'visible', timeout: 10000 });
    await this.createSavedCartButton.click();
    
    await this.savedCartNameInput.waitFor({ state: 'visible', timeout: 5000 });
    await this.savedCartNameInput.fill(cartName);
    
    await this.saveButton.click();
    
    await this.page.waitForTimeout(2000);
  }

  async expectSavedCartVisible(cartName: string) {
    const savedCart = this.savedCartItems.filter({ hasText: cartName });
    await expect(savedCart).toBeVisible({ timeout: 10000 });
  }

  async expectSavedCartInList(cartName: string) {
    await this.savedCartsList.waitFor({ state: 'visible', timeout: 10000 });
    // Look for the cart name as a link in the table structure
    const cartLink = this.page.locator('cw-saved-cart-list table tbody tr td a').filter({ hasText: cartName }).first();
    await expect(cartLink).toBeVisible();
  }

  async clickSavedCart(cartName: string) {
    // Click on the cart name link in the table to navigate to details
    const cartLink = this.page.locator('cw-saved-cart-list table tbody tr td a').filter({ hasText: cartName }).first();
    await cartLink.waitFor({ state: 'visible', timeout: 10000 });
    await cartLink.click();
  }

  async restoreSavedCart(cartName: string) {
    // Find the saved cart and click restore
    const savedCart = this.savedCartItems.filter({ hasText: cartName });
    const restoreBtn = savedCart.locator('button:has-text("Restore"), .restore-button');
    
    await restoreBtn.waitFor({ state: 'visible', timeout: 10000 });
    await restoreBtn.click();
    
    // Wait for restoration to complete
    await this.page.waitForTimeout(3000);
  }

  async restoreCartFromList(cartName: string) {
    const cartRow = this.page.locator('cw-saved-cart-list').locator('tr, .table-mobile-row').filter({ hasText: cartName });
    const restoreBtn = cartRow.locator('button:has-text("Restore cart")');
    
    await restoreBtn.waitFor({ state: 'visible', timeout: 10000 });
    await restoreBtn.click();
    
    // Wait for restoration to complete
    await this.page.waitForTimeout(3000);
  }

  async expectSuccessMessage() {
    await expect(this.savedCartMessage).toBeVisible({ timeout: 10000 });
    await expect(this.savedCartMessage).toContainText(/success|saved|restored/i);
  }

  async expectSavedCartsPageLoaded() {
    await expect(this.page).toHaveURL(/saved.*cart/);
    await this.savedCartsList.waitFor({ state: 'visible', timeout: 10000 });
  }
}
