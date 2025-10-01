import { Locator, Page, expect } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly proceedToCheckoutButton: Locator;
  readonly cartItems: Locator;
  readonly cartTotal: Locator;
  readonly emptyCartMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.proceedToCheckoutButton = page.getByRole('button', { name: /proceed to checkout/i });
    // Use more flexible selector for cart items
    this.cartItems = page.locator('cw-cart-item-list-row, cx-cart-item, [class*="cart-item"]');
    this.cartTotal = page.locator('cx-order-summary .cx-summary-total, cw-order-summary .summary-total');
    this.emptyCartMessage = page.locator('cx-cart-details .cx-empty, cw-cart-details .empty');
  }

  async goto() {
    await this.page.goto('/cart');
    // Wait for cart page to load - wait for cart items or empty message
    await this.page.waitForSelector('cw-cart-item-list-row, .empty-cart, [class*="cart"]', { timeout: 15000 });
  }

  async proceedToCheckout() {
    await this.proceedToCheckoutButton.waitFor({ state: 'visible' });
    await this.proceedToCheckoutButton.click();
  }

  async expectCartUrl() {
    await expect(this.page).toHaveURL(/\/cart/);
  }

  async expectCartNotEmpty() {
    await expect(this.cartItems.first()).toBeVisible({ timeout: 15000 });
  }
}
