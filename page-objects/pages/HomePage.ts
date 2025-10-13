import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly miniCart: Locator;
  readonly userMenu: Locator;
  readonly shopButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByRole('textbox', { name: /search/i });
    this.miniCart = page.locator('cx-mini-cart');
    this.userMenu = page.locator('cx-login');
    this.shopButton = page.getByRole('button', { name: 'Shop' });
  }

  async goto() {
    await this.page.goto('/');
    // Wait for page to be fully loaded
    await this.searchInput.waitFor({ state: 'visible' });
  }

  async searchProduct(query: string) {
    await this.searchInput.waitFor({ state: 'visible' });
    await this.searchInput.click();
    await this.searchInput.fill(query);
  }

  async searchProductAndSubmit(query: string) {
    await this.searchInput.waitFor({ state: 'visible' });
    await this.searchInput.click();
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
    // Wait for navigation to search results
    await this.page.waitForURL(/\/search\//, { timeout: 15000 });
  }

  async selectSearchSuggestion(productName: string) {
    await this.page.getByRole('option', { name: new RegExp(productName, 'i') }).click();
  }

  async expectHomepageLoaded() {
    await expect(this.page).toHaveTitle('Homepage');
  }

  async navigateToBrand(brandName: string) {
    await this.shopButton.waitFor({ state: 'visible' });
    await this.shopButton.click();
    await this.page.getByRole('link', { name: brandName, exact: true }).click();
  }

  async navigateToCollection(collectionName: string) {
    await this.page.getByRole('link', { name: collectionName }).click();
    // Wait for navigation to PLP - wait for product grid to appear
    await this.page.locator('cw-product-grid-item').first().waitFor({ state: 'visible', timeout: 15000 });
  }
}
