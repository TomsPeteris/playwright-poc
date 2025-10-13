import { test as base } from '@playwright/test';
import { CartPage } from '../page-objects/pages/CartPage';
import { CheckoutPage } from '../page-objects/pages/CheckoutPage';
import { HomePage } from '../page-objects/pages/HomePage';
import { LoginPage } from '../page-objects/pages/LoginPage';
import { ProductDetailPage } from '../page-objects/pages/ProductDetailPage';
import { ProductListPage } from '../page-objects/pages/ProductListPage';
import { SearchResultsPage } from '../page-objects/pages/SearchResultsPage';
import { SavedCartPage } from '../page-objects/pages/SavedCartPage';
import { testUsers } from './test-data';

type PageObjects = {
  loginPage: LoginPage;
  homePage: HomePage;
  productListPage: ProductListPage;
  productDetailPage: ProductDetailPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  searchResultsPage: SearchResultsPage;
  savedCartPage: SavedCartPage;
};

// Extend base test with page objects
export const test = base.extend<PageObjects>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  productListPage: async ({ page }, use) => {
    await use(new ProductListPage(page));
  },
  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  searchResultsPage: async ({ page }, use) => {
    await use(new SearchResultsPage(page));
  },
  savedCartPage: async ({ page }, use) => {
    await use(new SavedCartPage(page));
  },
});

// Authenticated user fixture
export const authenticatedTest = test.extend({
  page: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testUsers.validUser.username, testUsers.validUser.password);
    await page.waitForURL(/\/cwa\/en\/USD\/?$/);
    await use(page);
  },
});

export { expect } from '@playwright/test';
