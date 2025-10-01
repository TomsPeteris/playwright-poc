import { Page, Locator, expect } from '@playwright/test';

export class ProductListPage {
  readonly page: Page;
  readonly productGrid: Locator;
  readonly productCards: Locator;
  readonly sortDropdown: Locator;
  readonly filterSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productGrid = page.locator('cw-product-grid-item');
    this.productCards = page.locator('cw-product-grid-item');
    this.sortDropdown = page.locator('cx-sorting .ng-select');
    this.filterSection = page.locator('cx-product-facet-navigation');
  }

  async selectProductByCode(productCode: string) {
    const productCard = this.productCards.filter({ hasText: productCode });
    await productCard.waitFor({ state: 'visible', timeout: 15000 });
    
    // Find the main product link (not the "Add to cart" button)
    const productLink = productCard.locator('a').first();
    await productLink.waitFor({ state: 'visible', timeout: 10000 });
    
    // Click and wait for navigation
    await Promise.all([
      this.page.waitForURL(/\/product\//, { timeout: 15000 }),
      productLink.click()
    ]);
  }

  async selectProductByIndex(index: number) {
    await this.productCards.nth(index).waitFor({ state: 'visible' });
    await this.productCards.nth(index).locator('a').first().click();
    // Wait for navigation to PDP
    await this.page.waitForURL(/\/product\//, { timeout: 15000 });
  }

  async expectProductsVisible() {
    await expect(this.productCards.first()).toBeVisible();
  }

  async getProductCount(): Promise<number> {
    return await this.productCards.count();
  }
}
