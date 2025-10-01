import { Locator, Page, expect } from '@playwright/test';

export class ProductDetailPage {
  readonly page: Page;
  readonly addToCartButton: Locator;
  readonly addedToCartDialog: Locator;
  readonly viewCartLink: Locator;
  readonly productName: Locator;
  readonly productPrice: Locator;
  readonly quantityInput: Locator;

  constructor(page: Page) {
    this.page = page;
    // Use page-level button but wait for URL to ensure we're on PDP
    this.addToCartButton = page.getByRole('button', { name: /add to cart/i }).first();
    this.addedToCartDialog = page.locator('cx-added-to-cart-dialog');
    this.viewCartLink = this.addedToCartDialog.getByRole('link', { name: /view cart/i });
    this.productName = page.locator('h1').first();
    this.productPrice = page.locator('.price, .cx-price').first();
    this.quantityInput = page.locator('input[type="number"]').first();
  }

  async addToCart() {
    // Wait for button to be visible
    await this.addToCartButton.waitFor({ state: 'visible', timeout: 15000 });
    
    // Wait for product data to load (button becomes enabled)
    // Spartacus may take time to fetch product details from API
    // Increase timeout to 120s for slow backend responses
    await this.addToCartButton.click({ timeout: 120000 });
  }

  async expectProductDetailPageLoaded() {
    await expect(this.page).toHaveURL(/\/product\//);
    await expect(this.addToCartButton).toBeVisible();
  }

  async setQuantity(quantity: number) {
    await this.quantityInput.fill(quantity.toString());
  }

  async expectAddedToCartDialogVisible() {
    await this.addedToCartDialog.waitFor({ state: 'visible', timeout: 15000 });
    await expect(this.addedToCartDialog).toBeVisible();
  }

  async goToCart() {
    // Wait for dialog to fully load with product details
    await this.addedToCartDialog.waitFor({ state: 'visible', timeout: 15000 });
    await this.viewCartLink.waitFor({ state: 'visible', timeout: 15000 });
    await this.viewCartLink.click();
  }
}
