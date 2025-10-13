import { Locator, Page, expect } from '@playwright/test';

export class SearchResultsPage {
  readonly page: Page;
  readonly productTiles: Locator;
  readonly searchResultsContainer: Locator;
  readonly noResultsMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.productTiles = page.locator('[cw-product-tile]');
    this.searchResultsContainer = page.locator('cx-product-list');
    this.noResultsMessage = page.locator('.no-results, .empty-results');
  }

  async waitForSearchResults() {
    await Promise.race([
      this.productTiles.first().waitFor({ state: 'visible', timeout: 15000 }),
      this.noResultsMessage.waitFor({ state: 'visible', timeout: 15000 })
    ]).catch(() => {
      // If both fail, check in the test
    });
  }

  async selectProductByCode(productCode: string) {
    await this.productTiles.first().waitFor({ state: 'visible', timeout: 15000 });
    
    // Find the product tile containing the specific product code
    const productTile = this.productTiles.filter({ 
      has: this.page.locator('.model').filter({ hasText: productCode })
    });
    
    await expect(productTile).toBeVisible({ timeout: 10000 });
    
    const productLink = productTile.locator('a').first();
    await productLink.waitFor({ state: 'visible', timeout: 10000 });
    
    await Promise.all([
      this.page.waitForURL(/\/product\//, { timeout: 15000 }),
      productLink.click()
    ]);
  }

  async expectSearchResultsLoaded() {
    await expect(this.page).toHaveURL(/\/search\//);
    await this.waitForSearchResults();
  }

  async expectProductTileVisible(productCode: string) {
    const productTile = this.productTiles.filter({ 
      has: this.page.locator('.model').filter({ hasText: productCode })
    });
    await expect(productTile).toBeVisible();
  }

  async getProductCodesFromTiles(): Promise<string[]> {
    await this.productTiles.first().waitFor({ state: 'visible', timeout: 15000 });
    const modelElements = this.page.locator('[cw-product-tile] .model');
    const count = await modelElements.count();
    const codes: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const text = await modelElements.nth(i).textContent();
      if (text) {
        codes.push(text.trim());
      }
    }
    
    return codes;
  }
}
