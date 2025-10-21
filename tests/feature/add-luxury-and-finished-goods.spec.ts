import { BrowserContext, Page } from '@playwright/test';
import { expect, test } from '../../fixtures/custom-fixtures';
import { testProducts, testUsers } from '../../fixtures/test-data';
import { LoginPage } from '../../page-objects/pages/LoginPage';

test.describe('Add Luxury and Finished Goods In Cart', () => {
  // Run tests serially to avoid cart state conflicts and share authentication
  test.describe.configure({ mode: 'serial' });

  let sharedContext: BrowserContext;
  let sharedPage: Page;

  // Authenticate once before all tests and keep the context alive
  test.beforeAll(async ({ browser }) => {
    sharedContext = await browser.newContext();
    sharedPage = await sharedContext.newPage();
    const loginPage = new LoginPage(sharedPage);
    
    await loginPage.goto();
    await loginPage.login(testUsers.luxuryGoodsUser.username, testUsers.luxuryGoodsUser.password);
    await sharedPage.waitForURL(/\/cwa\/en\/USD\/?$/);
  });

  // Clean up the shared context after all tests
  test.afterAll(async () => {
    await sharedContext?.close();
  });

  // Clean up cart after each test, even if test fails
  test.afterEach(async ({}, testInfo) => {
    const { CartPage } = await import('../../page-objects/pages/CartPage');
    const cartPage = new CartPage(sharedPage);
    
    try {
      await cartPage.goto();
      await cartPage.removeAllItems();
    } catch (error) {
      console.log(`Cart cleanup failed for test "${testInfo.title}": ${error}`);
    }
  });

  // Override the page fixture to use our shared authenticated page
  test.use({
    page: async ({}, use) => {
      await use(sharedPage);
    }
  });

  test('should prevent adding luxury product when finished goods are in cart', async ({
    page,
    homePage,
    productDetailPage,
    cartPage,
  }) => {

    // Step 1: Navigate to Home Page
    await test.step('Navigate to Home Page', async () => {
      await homePage.goto();
      await expect(page).toHaveURL(/\/cwa\/en\/USD\/?$/);
    });

    // Step 2: Search for finished goods product and select from suggestions
    await test.step('Search for finished goods product and select from suggestions', async () => {
      const searchInput = page.getByRole('textbox', { name: /search/i });
      await searchInput.click();
      await searchInput.fill(testProducts.bulovaAllClocks.code);
      await page.waitForTimeout(1000);
      const suggestions = page.locator('ul[role="listbox"].products');
      await expect(suggestions).toBeVisible({ timeout: 5000 });
      
      const productSuggestion = suggestions.locator(`text=ID ${testProducts.bulovaAllClocks.code}`).first();
      await expect(productSuggestion).toBeVisible();
      await productSuggestion.click();
      
      await productDetailPage.expectProductDetailPageLoaded();
    });

    // Step 3: Add finished goods product to cart
    await test.step('Add finished goods product to cart', async () => {
      await productDetailPage.addToCart();
      await productDetailPage.expectAddedToCartDialogVisible();
    });

    // Step 4: Navigate to cart via View Cart button
    await test.step('Navigate to cart via View Cart button', async () => {
      await productDetailPage.goToCart();
      await expect(page).toHaveURL(/\/cart/);
    });

    // Step 5: Verify finished goods product is in cart
    await test.step('Verify finished goods product is in cart', async () => {
      await cartPage.expectProductInCart(testProducts.bulovaAllClocks.code);
    });

    // Step 6: Search for luxury product and select from suggestions
    await test.step('Search for luxury product and select from suggestions', async () => {
      const searchInput = page.getByRole('textbox', { name: /search/i });
      await searchInput.click();
      await searchInput.fill(testProducts.luxuryProduct.code);
      
      await page.waitForTimeout(1000);
      const suggestions = page.locator('ul[role="listbox"].products');
      await expect(suggestions).toBeVisible({ timeout: 5000 });
      
      const productSuggestion = suggestions.locator(`text=ID ${testProducts.luxuryProduct.code}`).first();
      await expect(productSuggestion).toBeVisible();
      await productSuggestion.click();
      
      await productDetailPage.expectProductDetailPageLoaded();
    });

    // Step 7: Try to add luxury product to cart
    await test.step('Try to add luxury product to cart', async () => {
      await productDetailPage.addToCart();
    });

    // Step 8: Verify error message about mixing luxury and non-luxury products
    await test.step('Verify error message about mixing luxury and non-luxury products', async () => {
      await productDetailPage.expectErrorMessage('LUXURY AND NON-LUXURY PRODUCTS CANNOT BE ADDED TO THE SAME CART');
    });

    // Step 9: Navigate to cart and verify only finished goods product is there
    await test.step('Navigate to cart and verify only finished goods product is there', async () => {
      await cartPage.goto();
      await cartPage.expectOnlyProductInCart(testProducts.bulovaAllClocks.code);
    });
  });

  test('should prevent adding finished goods when luxury product is in cart', async ({
    page,
    homePage,
    productDetailPage,
    cartPage,
  }) => {

    // Step 1: Navigate to Home Page
    await test.step('Navigate to Home Page', async () => {
      await homePage.goto();
      await expect(page).toHaveURL(/\/cwa\/en\/USD\/?$/);
    });

    // Step 2: Search for luxury product and select from suggestions
    await test.step('Search for luxury product and select from suggestions', async () => {
      const searchInput = page.getByRole('textbox', { name: /search/i });
      await searchInput.click();
      await searchInput.fill(testProducts.luxuryProduct.code);
      
      await page.waitForTimeout(1000);
      const suggestions = page.locator('ul[role="listbox"].products');
      await expect(suggestions).toBeVisible({ timeout: 5000 });
      
      const productSuggestion = suggestions.locator(`text=ID ${testProducts.luxuryProduct.code}`).first();
      await expect(productSuggestion).toBeVisible();
      await productSuggestion.click();
      
      await productDetailPage.expectProductDetailPageLoaded();
    });

    // Step 3: Add luxury product to cart
    await test.step('Add luxury product to cart', async () => {
      await productDetailPage.addToCart();
      await productDetailPage.expectAddedToCartDialogVisible();
    });

    // Step 4: Navigate to cart via View Cart button
    await test.step('Navigate to cart via View Cart button', async () => {
      await productDetailPage.goToCart();
      await expect(page).toHaveURL(/\/cart/);
    });

    // Step 5: Verify luxury product is in cart
    await test.step('Verify luxury product is in cart', async () => {
      await cartPage.expectProductInCart(testProducts.luxuryProduct.code);
    });

    // Step 6: Search for finished goods product and select from suggestions
    await test.step('Search for finished goods product and select from suggestions', async () => {
      const searchInput = page.getByRole('textbox', { name: /search/i });
      await searchInput.click();
      await searchInput.fill(testProducts.bulovaAllClocks.code);
      
      // Wait for suggestions to appear
      await page.waitForTimeout(1000);
      
      // Verify suggestions dropdown appears
      const suggestions = page.locator('ul[role="listbox"].products');
      await expect(suggestions).toBeVisible({ timeout: 5000 });
      
      // Click on the specific product suggestion
      const productSuggestion = suggestions.locator(`text=ID ${testProducts.bulovaAllClocks.code}`).first();
      await expect(productSuggestion).toBeVisible();
      await productSuggestion.click();
      
      // Verify navigation to PDP
      await productDetailPage.expectProductDetailPageLoaded();
    });

    // Step 7: Try to add finished goods product to cart
    await test.step('Try to add finished goods product to cart', async () => {
      await productDetailPage.addToCart();
    });

    // Step 8: Verify error message about mixing luxury and non-luxury products
    await test.step('Verify error message about mixing luxury and non-luxury products', async () => {
      await productDetailPage.expectErrorMessage('LUXURY PRODUCTS SHOULD BE ORDERED SEPARATELY FROM NON-LUXURY PRODUCTS');
    });

    // Step 9: Navigate to cart and verify only luxury product is there
    await test.step('Navigate to cart and verify only luxury product is there', async () => {
      await cartPage.goto();
      await cartPage.expectOnlyProductInCart(testProducts.luxuryProduct.code);
    });
  });
});
