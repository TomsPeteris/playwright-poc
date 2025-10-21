import { expect, test } from '../../fixtures/custom-fixtures';
import { testProducts, testUsers } from '../../fixtures/test-data';

test.describe('Global Search Navigation to PDP', () => {
  const SEARCH_TERM = testProducts.corsoClocks.code; // EW2390-50D
  const PRODUCT_NAME = testProducts.corsoClocks.name; // Product name
  const EXPECTED_SEARCH_URL_PATTERN = /\/cwa\/en\/USD\/search\/EW2390/;

  test('should complete comprehensive search functionality testing in single browser session', async ({
    page,
    loginPage,
    homePage,
    searchResultsPage,
    productDetailPage
  }) => {
    // Step 1: Login with valid credentials
    await test.step('Login with valid credentials', async () => {
      await loginPage.goto();
      await loginPage.login(testUsers.globalSearchUser.username, testUsers.globalSearchUser.password);
      await page.waitForURL(/\/cwa\/en\/USD\/?$/);
    });

    // Step 2: Verify user is logged in on homepage
    await test.step('Verify user is logged in on homepage', async () => {
      await homePage.goto();
      await expect(page).toHaveURL(/\/cwa\/en\/USD\/?$/);
      
      // Verify user is logged in by checking for search functionality
      await expect(page.getByRole('textbox', { name: /search/i })).toBeVisible();
    });

    // Step 3: Verify search bar placeholder text
    await test.step('Verify search bar is displayed in header with correct placeholder', async () => {
      const searchInput = page.getByRole('textbox', { name: /search/i });
      await expect(searchInput).toBeVisible();
      
      const placeholder = await searchInput.getAttribute('placeholder');
      expect(placeholder).toMatch(/Search by Product Name, SKU, Keyword/i);
    });

    // Step 4: Test search with SKU and verify suggestions
    await test.step('Enter known SKU in search bar and verify suggestions', async () => {
      const searchInput = page.getByRole('textbox', { name: /search/i });
      await searchInput.fill(SEARCH_TERM);
      
      // Wait for suggestions to appear
      await page.waitForTimeout(1000);
      
      // Verify product matching the SKU is displayed in suggestions list
      const suggestions = page.locator('ul[role="listbox"].products');
      await expect(suggestions).toBeVisible({ timeout: 5000 });
      
      // Look for the specific product code in the suggestions
      const suggestionItem = suggestions.locator(`text=ID ${SEARCH_TERM}`).first();
      await expect(suggestionItem).toBeVisible();
    });

    // Step 5: Clear search input by clicking X
    await test.step('Clear search input by clicking X', async () => {
      const clearButton = page.locator('button.reset[aria-label="Reset"]');
      await clearButton.click();
      
      // Verify search input is cleared
      const searchInput = page.getByRole('textbox', { name: /search/i });
      await expect(searchInput).toHaveValue('');
    });

    // Step 6: Test search with Product Name and verify suggestions
    await test.step('Enter known Product Name in search bar and verify suggestions', async () => {
      const searchInput = page.getByRole('textbox', { name: /search/i });
      await searchInput.fill(PRODUCT_NAME);
      await page.waitForTimeout(1000);
      const suggestions = page.locator('ul[role="listbox"].products');
      await expect(suggestions).toBeVisible({ timeout: 5000 });
      
      //To handle multiple products with same name
      const suggestionItem = suggestions.locator(`text=${PRODUCT_NAME}`).first();
      await expect(suggestionItem).toBeVisible();
    });

    // Step 7: Clear search input again
    await test.step('Clear search input by clicking X again', async () => {
      const clearButton = page.locator('button.reset[aria-label="Reset"]');
      await clearButton.click();
      
      // Verify search input is cleared
      const searchInput = page.getByRole('textbox', { name: /search/i });
      await expect(searchInput).toHaveValue('');
    });

    // Step 8: Test invalid search input and verify no results message
    await test.step('Enter invalid input and verify no results message', async () => {
      const searchInput = page.getByRole('textbox', { name: /search/i });
      await searchInput.fill('NONEXISTS');
      await page.waitForTimeout(1000);
      const noResultsMessage = page.locator('text=/We could not find any results|No results found/i');
      await expect(noResultsMessage).toBeVisible({ timeout: 5000 });
    });

    // Step 9: Clear search input after invalid search
    await test.step('Clear search input after invalid search', async () => {
      const clearButton = page.locator('button.reset[aria-label="Reset"]');
      await clearButton.click();
      
      // Verify search input is cleared
      const searchInput = page.getByRole('textbox', { name: /search/i });
      await expect(searchInput).toHaveValue('');
    });

    // Step 10: Test valid product SKU suggestions dropdown
    await test.step('Start typing valid product SKU and verify suggestions dropdown', async () => {
      const searchInput = page.getByRole('textbox', { name: /search/i });
      await searchInput.fill('AT2');
      await page.waitForTimeout(1000);
      
      // Verify dropdown with up to 5 relevant suggestions appears
      const suggestions = page.locator('ul[role="listbox"].products');
      await expect(suggestions).toBeVisible({ timeout: 5000 });
      
      // Count suggestions (should be up to 5)
      const suggestionItems = suggestions.locator('li a[role="option"]');
      const count = await suggestionItems.count();
      expect(count).toBeLessThanOrEqual(5);
      expect(count).toBeGreaterThan(0);
    });

    // Step 11: Select product from suggestions and navigate to PDP
    await test.step('Enter product SKU and select from suggestions', async () => {
      const searchInput = page.getByRole('textbox', { name: /search/i });
      // Clear previous input and enter new SKU
      await searchInput.clear();
      await searchInput.fill(testProducts.chandlerClocks.code);
      await page.waitForTimeout(1000);
      
      // Click on the specific product suggestion
      const suggestions = page.locator('ul[role="listbox"].products');
      const productSuggestion = suggestions.locator(`text=ID ${testProducts.chandlerClocks.code}`).first();
      await productSuggestion.click();
    });

    // Step 12: Verify navigation to PDP with correct product
    await test.step('Verify navigation to PDP with correct product', async () => {
      await expect(page).toHaveURL(/\/product\//);
      await productDetailPage.expectProductDetailPageLoaded();
      
      // Verify the product code matches
      await productDetailPage.expectProductCode(testProducts.chandlerClocks.code);
    });

    // Step 13: Navigate back to homepage for final search test
    await test.step('Navigate back to homepage for final search test', async () => {
      await homePage.goto();
      await expect(page).toHaveURL(/\/cwa\/en\/USD\/?$/);
    });

    // Step 14: Search for product using global search and submit
    await test.step('Search for product using global search', async () => {
      await homePage.searchProductAndSubmit(SEARCH_TERM);
      await expect(page).toHaveURL(EXPECTED_SEARCH_URL_PATTERN);
    });

    // Step 15: Verify search results are displayed
    await test.step('Verify search results are displayed', async () => {
      await searchResultsPage.expectSearchResultsLoaded();
      await searchResultsPage.expectProductTileVisible(SEARCH_TERM);
    });

    // Step 16: Select product from search results
    await test.step('Select product from search results', async () => {
      await searchResultsPage.selectProductByCode(SEARCH_TERM);
      await productDetailPage.expectProductDetailPageLoaded();
    });

    // Step 17: Verify product code on PDP matches search term
    await test.step('Verify product code on PDP matches search term', async () => {
      await productDetailPage.expectProductCode(SEARCH_TERM);
      
      //Get the actual product code and compare
      const actualProductCode = await productDetailPage.getProductCode();
      expect(actualProductCode).toContain(SEARCH_TERM);
    });
  });
});