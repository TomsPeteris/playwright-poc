import { expect, test } from '../../fixtures/custom-fixtures';
import { quickOrderProducts, testUsers } from '../../fixtures/test-data';

test.describe('Quick Order Functionality', () => {

  test('should add multiple products via quick order in single browser session', async ({
    page,
    loginPage,
    homePage,
    quickOrderPage,
  }) => {

    // Step 1: Login with valid credentials
    await test.step('Login with valid credentials', async () => {
      await loginPage.goto();
      await loginPage.login(testUsers.quickOrderUser.username, testUsers.quickOrderUser.password);
      await page.waitForURL(/\/cwa\/en\/USD\/?$/);
    });

    // Step 2: Navigate to Home Page and verify Quick Order link is visible
    await test.step('Navigate to homepage and verify Quick Order link is visible', async () => {
      await homePage.goto();
      await expect(page).toHaveURL(/\/cwa\/en\/USD\/?$/);
      
      const quickOrderLink = page.getByRole('link', { name: /quick.*order/i });
      await expect(quickOrderLink).toBeVisible();
    });

    // Step 3: Navigate to Quick Order page via link
    await test.step('Navigate to Quick Order page', async () => {
      await quickOrderPage.navigateViaLink();
      await quickOrderPage.expectQuickOrderPageLoaded();
    });

    // Step 4: Add all 10 products to quick order
    await test.step('Add 10 products to quick order table', async () => {
      for (const productCode of quickOrderProducts) {
        console.log(`Adding product: ${productCode}`);
        await quickOrderPage.searchAndSelectProduct(productCode);
      }
    });

    // Step 5: Verify all 10 products are in the table
    await test.step('Verify all 10 products are added to quick order table', async () => {
      const productCount = await quickOrderPage.getProductCount();
      expect(productCount).toBe(10);
      
      const allCodes = await quickOrderPage.getAllProductCodesInTable();
      console.log('Products in table:', allCodes);
      
      // Verify each product code is in the table
      for (const productCode of quickOrderProducts) {
        const isInTable = await quickOrderPage.verifyProductInTable(productCode);
        expect(isInTable).toBeTruthy();
      }
    });

    // Step 15: Try to add 11th product and verify max products message
    await test.step('Attempt to add 11th product and verify max products message', async () => {
      await quickOrderPage.productInput.click();
      await quickOrderPage.productInput.fill('AU1054-54G');// 11th Product SKU
      await page.waitForTimeout(1000);
      await quickOrderPage.expectMaxProductsMessage();
    });

    // Step 16: Click Reset button
    await test.step('Click Reset button to clear input', async () => {
      await quickOrderPage.clickReset();
      await expect(quickOrderPage.productInput).toHaveValue('');
    });

    // Step 17: Export products
    await test.step('Export products to CSV', async () => {
      await quickOrderPage.exportProducts();
    });

    // Step 18: Empty the list
    await test.step('Empty the quick order list', async () => {
      await quickOrderPage.clickEmptyList();
      await quickOrderPage.expectSuccessMessage('Quick order list has been cleared');
      await quickOrderPage.expectTableEmpty();
    });

    // Step 19: Verify Download Template link is available
    await test.step('Verify Download Template link is available', async () => {
        await quickOrderPage.downloadTemplate();
    });

    // Step 20: Verify import functionality
    await test.step('Verify Import Products button is visible', async () => {
      await expect(quickOrderPage.importButton).toBeVisible();
    });

    // Step 21: Import products from CSV file
    await test.step('Import products from CSV file', async () => {
        await quickOrderPage.importProductsFromFile('fixtures/csv/product_import_10.csv');
    });

    // Step 22: Verify all products from file are loaded in table
    await test.step('Verify all products from file are loaded in table', async () => {
        await quickOrderPage.expectProductsLoadedFromFile(quickOrderProducts);
        const productCount = await quickOrderPage.getProductCount();
        expect(productCount).toBe(10);
        console.log('All 10 products successfully loaded from CSV file');
    });

    // Step 23: Empty the list
    await test.step('Empty the quick order list', async () => {
        await quickOrderPage.clickEmptyList();
        await quickOrderPage.expectSuccessMessage('Quick order list has been cleared');
        await quickOrderPage.expectTableEmpty();
      });
  });
});
