import { Page } from '@playwright/test';
import { authenticatedTest as test } from '../../fixtures/custom-fixtures';
import { checkoutData, testProducts } from '../../fixtures/test-data';

test.describe('Checkout Flow - Critical Path', () => {

  let sharedPage: Page;

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

  test('should complete full checkout journey', async ({ 
    page, 
    homePage,
    productListPage,
    productDetailPage, 
    cartPage, 
    checkoutPage 
  }) => {
    sharedPage = page;
    await test.step('Navigate to product through menu', async () => {
      await homePage.navigateToBrand(testProducts.bulovaAllClocks.brand);
      await homePage.navigateToCollection(testProducts.bulovaAllClocks.collection);
    });

    await test.step('Select product from PLP', async () => {
      await productListPage.selectProductByCode(testProducts.bulovaAllClocks.code);
    });

    await test.step('Add product to cart', async () => {
      await productDetailPage.addToCart();
      await productDetailPage.expectAddedToCartDialogVisible();
      await productDetailPage.goToCart();
    });

    await test.step('Verify cart and proceed to checkout', async () => {
      await cartPage.goto();
      await cartPage.expectCartUrl();
      await cartPage.proceedToCheckout();
      await checkoutPage.expectDeliveryAddressStep();
    });

    await test.step('Checkout Step 1: Delivery Address', async () => {
      await checkoutPage.continueFromDeliveryAddress();
      await checkoutPage.expectDeliveryModeStep();
    });
    
    await test.step('Checkout Step 2: Delivery Mode & Order Details', async () => {
      await checkoutPage.fillDeliveryModeDetails(
        checkoutData.poNumber
      );
      await checkoutPage.continueFromDeliveryMode();
      await checkoutPage.expectReviewOrderStep();
    });

    await test.step('Checkout Step 3: Review & Place Order', async () => {
      await checkoutPage.acceptTermsAndConditions();
      await checkoutPage.placeOrder();
    });
    
    await test.step('Verify order confirmation', async () => {
      await checkoutPage.expectOrderConfirmationPage();
    });
  });
});
