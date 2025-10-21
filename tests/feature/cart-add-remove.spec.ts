import { expect, test } from '../../fixtures/custom-fixtures';
import { testProducts, testUsers } from '../../fixtures/test-data';
import { LoginPage } from '../../page-objects/pages/LoginPage';
import { BrowserContext, Page } from '@playwright/test';

test.describe('Cart Add and Remove - Feature Tests', () => {
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
    await loginPage.login(testUsers.cartAddRemoveUser.username, testUsers.cartAddRemoveUser.password);
    await sharedPage.waitForURL(/\/cwa\/en\/USD\/?$/);
  });

  // Clean up the shared context after all tests
  test.afterAll(async () => {
    await sharedContext?.close();
  });

  // Override the page fixture to use our shared authenticated page
  test.use({
    page: async ({}, use) => {
      await use(sharedPage);
    }
  });

  // Helper function to add a product to cart
  async function addProductToCart(
    homePage: any,
    productListPage: any,
    productDetailPage: any,
    product: { brand: string; collection: string; code: string },
    navigateToCart = false
  ) {
    await homePage.goto();
    await homePage.navigateToBrand(product.brand);
    await homePage.navigateToCollection(product.collection);
    await productListPage.selectProductByCode(product.code);
    await productDetailPage.expectProductDetailPageLoaded();
    await productDetailPage.addToCart();
    await productDetailPage.expectAddedToCartDialogVisible();
    
    if (navigateToCart) {
      await productDetailPage.goToCart();
    }
  }

  // Helper function to verify empty cart
  async function verifyEmptyCart(cartPage: any) {
    await cartPage.expectCartEmpty();
    await cartPage.expectEmptyCartMessage();
    await cartPage.expectEmptyCartElements();
    expect(await cartPage.getCartItemsCount()).toBe(0);
  }

  test('should add product to cart and remove it by SKU', async ({ 
    homePage, 
    productListPage, 
    productDetailPage, 
    cartPage 
  }) => {
    let addedProductSku: string;

    await test.step('Add product to cart', async () => {
      await addProductToCart(homePage, productListPage, productDetailPage, testProducts.bulovaAllClocks, true);
    });

    await test.step('Verify product is in cart and get SKU', async () => {
      await cartPage.expectCartUrl();
      await cartPage.expectCartNotEmpty();
      
      const cartItems = await cartPage.getAllCartItems();
      addedProductSku = cartItems[0].sku;
      console.log(`Product in cart: ${addedProductSku}`);
    });

    await test.step('Remove product by SKU', async () => {
      await cartPage.removeItemBySku(addedProductSku);
      console.log('Product removed');
    });

    await test.step('Verify cart is empty', async () => {
      await verifyEmptyCart(cartPage);
      console.log('Cart is empty');
    });
  });

  test('should remove first item iteratively until cart is empty', async ({ 
    homePage, 
    productListPage, 
    productDetailPage, 
    cartPage 
  }) => {
    await test.step('Add first product to cart', async () => {
      await addProductToCart(homePage, productListPage, productDetailPage, testProducts.bulovaAllClocks);
      console.log('First product added');
    });

    await test.step('Add second product to cart', async () => {
      await addProductToCart(homePage, productListPage, productDetailPage, testProducts.citizenTsuyosa, true);
      console.log('Second product added');
    });

    await test.step('Verify cart has multiple items', async () => {
      await cartPage.expectCartUrl();
      const itemCount = await cartPage.getCartItemsCount();
      expect(itemCount).toBeGreaterThanOrEqual(2);
      console.log(`Cart contains ${itemCount} items`);
    });

    await test.step('Remove items one by one', async () => {
      let itemCount = await cartPage.getCartItemsCount();
      console.log(`Starting removal: ${itemCount} item(s)`);
      
      while (itemCount > 0) {
        await cartPage.removeFirstItem();
        itemCount = await cartPage.getCartItemsCount();
        console.log(`Items remaining: ${itemCount}`);
      }
    });

    await test.step('Verify cart is empty', async () => {
      await verifyEmptyCart(cartPage);
      console.log('Cart is empty');
    });
  });

  test('should clear cart using Clear Cart button', async ({ 
    homePage, 
    productListPage, 
    productDetailPage, 
    cartPage 
  }) => {
    await test.step('Add product to cart', async () => {
      await addProductToCart(homePage, productListPage, productDetailPage, testProducts.bulovaAllClocks, true);
    });

    await test.step('Verify cart has items', async () => {
      await cartPage.expectCartUrl();
      await cartPage.expectCartNotEmpty();
      console.log(`Cart has items`);
    });

    await test.step('Clear cart via button', async () => {
      await cartPage.clickClearCart();
      await cartPage.expectClearCartDialogVisible();
      await cartPage.confirmClearCart();
      console.log('Cart cleared');
    });

    await test.step('Verify cart is empty', async () => {
      await verifyEmptyCart(cartPage);
      console.log('Cart is empty');
    });
  });

  test('should cancel Clear Cart dialog and keep items', async ({ 
    homePage, 
    productListPage, 
    productDetailPage, 
    cartPage 
  }) => {
    await test.step('Add product to cart', async () => {
      await addProductToCart(homePage, productListPage, productDetailPage, testProducts.bulovaAllClocks, true);
      console.log('Product added to cart');
    });

    await test.step('Verify cart has items', async () => {
      await cartPage.expectCartUrl();
      const initialCount = await cartPage.getCartItemsCount();
      expect(initialCount).toBeGreaterThan(0);
      console.log(`Cart contains ${initialCount} item(s)`);
    });

    await test.step('Click Clear Cart button', async () => {
      await cartPage.clickClearCart();
      console.log('Clear Cart button clicked');
    });

    await test.step('Verify Clear Cart dialog appears', async () => {
      await cartPage.expectClearCartDialogVisible();
      console.log('Clear Cart dialog is visible');
    });

    await test.step('Cancel clear cart action', async () => {
      await cartPage.cancelClearCart();
      console.log('Clear Cart cancelled');
    });

    await test.step('Verify cart still has items', async () => {
      const finalCount = await cartPage.getCartItemsCount();
      expect(finalCount).toBeGreaterThan(0);
      console.log(`Cart still contains ${finalCount} item(s) - cancel worked correctly`);
    });
  });
});
