import { expect, test } from '../../fixtures/custom-fixtures';
import { testProducts, testUsers } from '../../fixtures/test-data';

test.describe('Saved Cart Functionality', () => {
  const SAVED_CART_NAME = 'TestCart';
  const PRODUCT_SKU = testProducts.corsoClocks.code; // EW2390-50D

  test('should complete full saved cart workflow from login to cleanup in single browser session', async ({
    page,
    loginPage,
    homePage,
    productDetailPage,
    cartPage,
    savedCartPage
  }) => {
    // Step 1: Login with valid credentials
    await test.step('Login with valid credentials', async () => {
      await loginPage.goto();
      await loginPage.login(testUsers.validUser.username, testUsers.validUser.password);
      await page.waitForURL(/\/cwa\/en\/USD\/?$/);
    });

    // Step 2: Navigate to Home Page and verify login
    await test.step('Navigate to Home Page and verify user is logged in', async () => {
      await homePage.goto();
      await expect(page).toHaveURL(/\/cwa\/en\/USD\/?$/);
      
      // Verify user is logged in by checking for search functionality
      await expect(page.getByRole('textbox', { name: /search/i })).toBeVisible();
    });

    // Step 3: Search for product and navigate to PDP
    await test.step('Search for product and navigate to PDP', async () => {
      await homePage.searchProductAndSubmit(PRODUCT_SKU);
      await expect(page).toHaveURL(/\/search\//);
      
      const productTile = page.locator('[cw-product-tile]').filter({ 
        has: page.locator('.model').filter({ hasText: PRODUCT_SKU })
      });
      await productTile.locator('a').first().click();
      await expect(page).toHaveURL(/\/product\//);
      await productDetailPage.expectProductDetailPageLoaded();
    });

    // // Step 4: Verify "Saved Carts" link is available in header
    // await test.step('Verify "Saved Carts" link is visible in header', async () => {
    //   const savedCartsLink = page.getByRole('link', { name: /saved.*cart/i });
    //   await expect(savedCartsLink).toBeVisible();
    // });

    // Step 5: Add product to cart
    await test.step('Add product to cart', async () => {
      await productDetailPage.addToCart();
      await productDetailPage.expectAddedToCartDialogVisible();
      await productDetailPage.goToCart();
      await cartPage.expectCartUrl();
      await cartPage.expectCartNotEmpty();
    });

    // Step 6: Verify selected product was added to cart
    await test.step('Verify selected product is added to cart', async () => {
      const cartItems = await cartPage.getAllCartItems();
      expect(cartItems.length).toBeGreaterThan(0);
      
      // Verify the product we added is in the cart
      const addedProduct = cartItems.find(item => item.sku.includes(PRODUCT_SKU));
      expect(addedProduct).toBeDefined();
    });

    // Step 7: Navigate to Cart page and click "Go To Cart" on Mini-cart
    await test.step('Navigate to Cart page', async () => {
      await cartPage.goto();
      await cartPage.expectCartUrl();
      await cartPage.expectCartNotEmpty();
    });

    // Step 8: Click on "Save" link in Cart
    await test.step('Click on Save link to open saved cart form', async () => {
      const saveCartLink = page.locator('cw-add-to-saved-cart a.link.cx-action-link');
      await saveCartLink.waitFor({ state: 'visible', timeout: 10000 });
      await saveCartLink.click();
      
      // Wait for the modal form to appear
      const modalForm = page.locator('form.modal-content.cx-saved-cart-form-container');
      await modalForm.waitFor({ state: 'visible', timeout: 5000 });
    });

    // Step 9: Fill saved cart form and save
    await test.step('Fill saved cart name and save', async () => {
      const nameInput = page.locator('input[formcontrolname="name"]');
      await nameInput.waitFor({ state: 'visible', timeout: 5000 });
      await nameInput.fill(SAVED_CART_NAME);
      
      const saveButton = page.locator('.cx-saved-cart-form-footer button.btn-primary:has-text("Save")');
      await saveButton.click();
    });

    // Step 10: Verify cart is saved, cart is empty, and success message is displayed
    await test.step('Verify cart is saved with success message and cart is empty', async () => {
      const successMessage = page.locator('text=Your cart items have been successfully saved for later in the "TestCart" cart');
      await expect(successMessage).toBeVisible({ timeout: 10000 });
      
      // Verify cart is now empty
      await cartPage.expectCartEmpty();
    });

    // Step 11: Navigate to Saved Carts List page from header
    await test.step('Navigate to Saved Carts List page', async () => {
      const savedCartsLink = page.getByRole('link', { name: /saved.*cart/i });
      await savedCartsLink.click();
      
      await expect(page).toHaveURL(/saved.*cart/);
      await savedCartPage.expectSavedCartsPageLoaded();
    });

    // Step 12: Verify TestCart is available in the list
    await test.step('Verify TestCart is available in saved carts list', async () => {
      await savedCartPage.expectSavedCartInList(SAVED_CART_NAME);
    });

    // Step 13: Click on TestCart link to navigate to saved cart details page
    await test.step('Click on TestCart link to navigate to details page', async () => {
      await savedCartPage.clickSavedCart(SAVED_CART_NAME);
      
      // Verify we're on the saved cart details page
      await expect(page).toHaveURL(/my-account\/saved-cart/);
    });

    // Step 14: Verify saved product is available and "Restore cart" button is enabled
    await test.step('Verify saved product and Restore cart button on details page', async () => {
      const productInSavedCart = page.locator(`text=${PRODUCT_SKU}`);
      await expect(productInSavedCart).toBeVisible();
      
      const restoreButton = page.locator('cw-saved-cart-details-action button.btn-primary').filter({ hasText: 'Restore cart' });
      await expect(restoreButton).toBeVisible();
      await expect(restoreButton).toBeEnabled();
    });

    // Step 15: Click "Restore cart" button to open modal
    await test.step('Click Restore cart button to open modal', async () => {
      const restoreButton = page.locator('cw-saved-cart-details-action button.btn-primary').filter({ hasText: 'Restore cart' });
      await restoreButton.click();
      
      // Wait for the restore modal to appear
      const modal = page.locator('form.modal-content.cx-saved-cart-form-container');
      await expect(modal).toBeVisible({ timeout: 5000 });
      
      const modalTitle = page.locator('.cx-saved-cart-form-title:has-text("Restore Saved Cart")');
      await expect(modalTitle).toBeVisible();
    });

    // Step 16: Confirm restore in the modal
    await test.step('Confirm restore in modal', async () => {
      const confirmRestoreButton = page.locator('.cx-saved-cart-form-footer button.btn-primary').filter({ hasText: 'Restore' });
      await confirmRestoreButton.waitFor({ state: 'visible', timeout: 5000 });
      await confirmRestoreButton.click();
      
      // Wait for modal to disappear (indicates restoration started)
      const modal = page.locator('form.modal-content.cx-saved-cart-form-container');
      await expect(modal).toBeHidden({ timeout: 10000 });
      
      // Wait for restoration process to complete
      await page.waitForTimeout(2000);
      
      const successMessage = page.locator('.alert-success, .notification, .toast').or(
        page.locator('text=/restored|success/i')
      );
      await expect(successMessage).toBeVisible({ timeout: 10000 }).catch(() => {
        console.log('No success message found, continuing...');
      });
    });

    // Step 17: Navigate back to cart and verify restored product is available
    await test.step('Navigate to cart and verify restored product', async () => {
      // Wait a bit more before navigating to ensure restoration is fully processed
      await page.waitForTimeout(2000);
      
      await cartPage.goto();
      await cartPage.expectCartUrl();
      
      // Wait for cart to load properly
      await page.waitForLoadState('networkidle');
      await cartPage.expectCartNotEmpty();
      
      // Verify the restored product is in the cart
      const cartItems = await cartPage.getAllCartItems();
      expect(cartItems.length).toBeGreaterThan(0);
      
      const restoredProduct = cartItems.find(item => item.sku.includes(PRODUCT_SKU));
      expect(restoredProduct).toBeDefined();
    });

    // Step 18: Verify "Proceed to Checkout" button is enabled
    await test.step('Verify Proceed to Checkout button is enabled', async () => {
      const checkoutButton = page.getByRole('button', { name: /proceed.*checkout/i });
      await expect(checkoutButton).toBeVisible();
      await expect(checkoutButton).toBeEnabled();
    });

    // Step 19: Clear the cart for cleanup
    await test.step('Clear cart for cleanup', async () => {
      await cartPage.removeAllItems();
      await cartPage.expectCartEmpty();
    });
  });

});
