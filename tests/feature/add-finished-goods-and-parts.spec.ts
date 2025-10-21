import { BrowserContext, Page } from '@playwright/test';
import { expect, test } from '../../fixtures/custom-fixtures';
import { testParts, testProducts, testUsers } from '../../fixtures/test-data';
import { LoginPage } from '../../page-objects/pages/LoginPage';

test.describe('Add Finished Goods and Parts In Cart', () => {
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
    await loginPage.login(testUsers.finishedGoodsPartsUser.username, testUsers.finishedGoodsPartsUser.password);
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

  test('should prevent adding  product when parts are in cart', async ({
    page,
    homePage,
    partsSearchPage,
    productDetailPage,
    cartPage,
  }) => {

    // Step 1: Navigate to Home Page and verify Parts link is visible
    await test.step('Navigate to Home Page and verify Parts link is visible', async () => {
      await homePage.goto();
      await expect(page).toHaveURL(/\/cwa\/en\/USD\/?$/);
      
      const categoryNavigation = page.locator('cw-category-navigation');
      await expect(categoryNavigation).toBeVisible();
      
      const partsLink = page.getByRole('link', { name: 'Parts' });
      await expect(partsLink).toBeVisible();
    });

    // Step 2: Navigate to Parts search page
    await test.step('Navigate to Parts search page', async () => {
      await partsSearchPage.navigateViaLink();
    });

    // Step 3: Search for part by model number
    await test.step('Search for part by model number', async () => {
      await partsSearchPage.searchByModelNumber(testParts.part1.modelNumber);
    });

    // Step 4: Verify part appears in results
    await test.step('Verify part appears in results', async () => {
      await partsSearchPage.expectPartInResults(testParts.part1.partNumber);
    });

    // Step 5: Add part to cart
    await test.step('Add part to cart', async () => {
      await partsSearchPage.addPartToCart(testParts.part1.partNumber);
      await productDetailPage.expectAddedToCartDialogVisible();
    });

    // Step 6: Navigate to cart via View Cart button
    await test.step('Navigate to cart via View Cart button', async () => {
      await productDetailPage.goToCart();
      await expect(page).toHaveURL(/\/cart/);
    });

    // Step 7: Verify part is in cart
    await test.step('Verify part is in cart', async () => {
      await cartPage.expectProductInCart(testParts.part1.partNumber);
    });

    // Step 8: Search for a product and select from suggestions
    await test.step('Search for a product and select from suggestions', async () => {
      const searchInput = page.getByRole('textbox', { name: /search/i });
      await searchInput.click();
      await searchInput.fill(testProducts.bulovaAllClocks.code);
      
      // Wait for suggestions to appear
      await page.waitForTimeout(1000);
      
      // Verify suggestions dropdown appears
      const suggestions = page.locator('ul[role="listbox"].products');
      await expect(suggestions).toBeVisible({ timeout: 5000 });
      
      // Click on the specific product suggestion
      const productSuggestion = suggestions.locator(`text=ID ${testProducts. bulovaAllClocks.code}`).first();
      await expect(productSuggestion).toBeVisible();
      await productSuggestion.click();
      
      // Verify navigation to PDP
      await productDetailPage.expectProductDetailPageLoaded();
    });

    // Step 9: Try to add a product to cart
    await test.step('Try to add a product to cart', async () => {
      await productDetailPage.addToCart();
    });

    // Step 10: Verify error message appears
    await test.step('Verify error message about mixing parts and goods', async () => {
      await productDetailPage.expectErrorMessage('LUXURY PRODUCTS SHOULD BE ORDERED SEPARATELY FROM NON-LUXURY PRODUCTS OR PARTS');
    });

    // Step 11: Navigate to cart and verify only part is there
    await test.step('Navigate to cart and verify only part is there', async () => {
      await cartPage.goto();
      await cartPage.expectOnlyProductInCart(testParts.part1.partNumber);
    });
  });

  test('should prevent adding parts when a product is in cart', async ({
    page,
    homePage,
    partsSearchPage,
    productDetailPage,
    cartPage,
  }) => {

    // Step 1: Navigate to Home Page
    await test.step('Navigate to Home Page', async () => {
      await homePage.goto();
      await expect(page).toHaveURL(/\/cwa\/en\/USD\/?$/);
    });

    // Step 2: Search for a product and select from suggestions
    await test.step('Search for a product and select from suggestions', async () => {
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

    // Step 3: Add a product to cart
    await test.step('Add a product to cart', async () => {
      await productDetailPage.addToCart();
      await productDetailPage.expectAddedToCartDialogVisible();
    });

    // Step 4: Navigate to cart via View Cart button
    await test.step('Navigate to cart via View Cart button', async () => {
      await productDetailPage.goToCart();
      await expect(page).toHaveURL(/\/cart/);
    });

    // Step 5: Verify a product is in cart
    await test.step('Verify a product is in cart', async () => {
      await cartPage.expectProductInCart(testProducts.bulovaAllClocks.code);
    });

    // Step 6: Navigate to Parts search page
    await test.step('Navigate to Parts search page', async () => {
      await partsSearchPage.navigateViaLink();
    });

    // Step 7: Search for part by model number
    await test.step('Search for part by model number', async () => {
      await partsSearchPage.searchByModelNumber(testParts.part1.modelNumber);
    });

    // Step 8: Verify part appears in results
    await test.step('Verify part appears in results', async () => {
      await partsSearchPage.expectPartInResults(testParts.part1.partNumber);
    });

    // Step 9: Try to add part to cart
    await test.step('Try to add part to cart', async () => {
      await partsSearchPage.addPartToCart(testParts.part1.partNumber);
    });

    // Step 10: Verify error message appears
    await test.step('Verify error message about parts must be ordered separately', async () => {
      const errorMessage = page.locator('.alert.alert-danger');
      await expect(errorMessage).toBeVisible({ timeout: 10000 });
      await expect(errorMessage).toContainText('PARTS MUST BE ORDERED SEPARATELY FROM OTHER ITEMS');
    });

    // Step 11: Navigate to cart and verify only a product is there
    await test.step('Navigate to cart and verify only a product is there', async () => {
      await cartPage.goto();
      await cartPage.expectOnlyProductInCart(testProducts.bulovaAllClocks.code);
    });
  });
});
