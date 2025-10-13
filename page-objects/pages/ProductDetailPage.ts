import { Locator, Page, expect } from '@playwright/test';

export class ProductDetailPage {
  readonly page: Page;
  readonly addToCartButton: Locator;
  readonly addedToCartDialog: Locator;
  readonly viewCartLink: Locator;
  readonly productName: Locator;
  readonly productPrice: Locator;
  readonly quantityInput: Locator;
  readonly productCode: Locator;

  constructor(page: Page) {
    this.page = page;
    // Use page-level button but wait for URL to ensure we're on PDP
    this.addToCartButton = page.getByRole('button', { name: /add to cart/i }).first();
    this.addedToCartDialog = page.locator('cx-added-to-cart-dialog');
    this.viewCartLink = this.addedToCartDialog.getByRole('link', { name: /view cart/i });
    this.productName = page.locator('h1').first();
    this.productPrice = page.locator('.price, .cx-price').first();
    this.quantityInput = page.locator('input[type="number"]').first();
    this.productCode = page.locator('.product-code, .model, .sku').first();
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
    // Wait for dialog to appear
    await this.addedToCartDialog.waitFor({ state: 'visible', timeout: 15000 });
    await expect(this.addedToCartDialog).toBeVisible();
    
    // Wait for view cart button to be visible (ensures cart update is complete)
    await this.viewCartLink.waitFor({ state: 'visible', timeout: 15000 });
    await expect(this.viewCartLink).toBeVisible();
  }

  async goToCart() {
    // Wait for dialog to fully load with product details
    await this.addedToCartDialog.waitFor({ state: 'visible', timeout: 15000 });
    await this.viewCartLink.waitFor({ state: 'visible', timeout: 15000 });
    await this.viewCartLink.click();
  }

  async expectProductCode(expectedCode: string) {
    const codeSelectors = [
      '.product-code',
      '.model', 
      '.sku',
      '[data-testid="product-code"]',
      '.product-details .model'
    ];
    
    let foundCode = false;
    for (const selector of codeSelectors) {
      const element = this.page.locator(selector);
      if (await element.isVisible()) {
        await expect(element).toContainText(expectedCode);
        foundCode = true;
        break;
      }
    }
    
    // If no specific product code element found, check page content
    if (!foundCode) {
      await expect(this.page.locator('body')).toContainText(expectedCode);
    }
  }

  async getProductCode(): Promise<string> {
    const codeSelectors = [
      '.product-code',
      '.model', 
      '.sku',
      '[data-testid="product-code"]',
      '.product-details .model'
    ];
    
    for (const selector of codeSelectors) {
      const element = this.page.locator(selector);
      if (await element.isVisible()) {
        const text = await element.textContent();
        if (text) {
          return text.trim();
        }
      }
    }
    
    throw new Error('Product code not found on the page');
  }
}
