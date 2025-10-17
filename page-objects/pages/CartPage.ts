import { Locator, Page, expect } from '@playwright/test';

interface CartItemData {
  sku: string;
  name: string;
  retailPrice: number;
  costPrice: number;
  quantity: number;
  shipQty: number;
  shipPrice: number;
  boQty: number;
  boPrice: number;
  totalPrice: number;
}

export class CartPage {
  readonly page: Page;
  readonly proceedToCheckoutButton: Locator;
  readonly cartItems: Locator;
  readonly cartTotal: Locator;
  readonly emptyCartMessage: Locator;
  readonly emptyCartHeading: Locator;
  readonly continueBrowsingButton: Locator;
  readonly orderSummary: Locator;
  readonly clearCartButton: Locator;
  readonly clearCartDialog: Locator;
  readonly clearCartDialogConfirmButton: Locator;
  readonly clearCartDialogCancelButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.proceedToCheckoutButton = page.getByRole('button', { name: /proceed to checkout/i });
    // Cart items are <tr> elements with cw-cart-item-list-row attribute
    this.cartItems = page.locator('tr[cw-cart-item-list-row]');
    this.cartTotal = page.locator('cx-order-summary .cx-summary-total, cw-order-summary .summary-total');
    this.emptyCartMessage = page.locator('cx-page-slot[position="EmptyCartMiddleContent"]');
    this.emptyCartHeading = page.locator('h3:has-text("Your shopping cart is empty")');
    this.continueBrowsingButton = page.getByRole('link', { name: /continue browsing/i });
    this.orderSummary = page.locator('cw-order-summary');
    this.clearCartButton = page.locator('cw-clear-cart a.link');
    this.clearCartDialog = page.locator('cx-clear-cart-dialog');
    this.clearCartDialogConfirmButton = this.clearCartDialog.locator('button.btn-primary:has-text("Clear")');
    this.clearCartDialogCancelButton = this.clearCartDialog.locator('button.btn-secondary:has-text("Cancel")');
    this.errorMessage = page.locator('.alert.alert-danger');
  }

  async goto() {
    await this.page.goto('/cart');
    // Wait for cart page to load - wait for cart items table or empty message
    await this.page.waitForSelector('cw-cart-item-list, cx-page-slot[position="EmptyCartMiddleContent"]', { timeout: 15000 });
  }

  async proceedToCheckout() {
    await this.proceedToCheckoutButton.waitFor({ state: 'visible' });
    await this.proceedToCheckoutButton.click();
  }

  async expectCartUrl() {
    await expect(this.page).toHaveURL(/\/cart/);
  }

  async expectCartNotEmpty() {
    // Wait for at least one cart item to exist
    await expect(this.cartItems).not.toHaveCount(0, { timeout: 15000 });
    await expect(this.cartItems.first()).toBeVisible();
  }

  async expectCartEmpty() {
    // Wait for empty cart message or verify no items exist
    await expect(this.cartItems).toHaveCount(0, { timeout: 10000 });
  }

  async expectEmptyCartMessage() {
    // Verify empty cart message is displayed
    await expect(this.emptyCartHeading).toBeVisible({ timeout: 10000 });
    await expect(this.emptyCartHeading).toHaveText(/your shopping cart is empty/i);
  }

  async expectEmptyCartElements() {
    // Verify all empty cart elements are present
    await expect(this.emptyCartMessage).toBeVisible({ timeout: 10000 });
    await expect(this.emptyCartHeading).toBeVisible();
    await expect(this.continueBrowsingButton).toBeVisible();
  }

  async clickClearCart() {
    await this.clearCartButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.clearCartButton.click();
  }

  async expectClearCartDialogVisible() {
    await this.clearCartDialog.waitFor({ state: 'visible', timeout: 10000 });
    await expect(this.clearCartDialog).toBeVisible();
    await expect(this.clearCartDialogConfirmButton).toBeVisible();
    await expect(this.clearCartDialogCancelButton).toBeVisible();
  }

  async confirmClearCart() {
    await this.clearCartDialogConfirmButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.clearCartDialogConfirmButton.click();
    
    // Wait for dialog to close
    await this.clearCartDialog.waitFor({ state: 'hidden', timeout: 10000 });
  }

  async cancelClearCart() {
    await this.clearCartDialogCancelButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.clearCartDialogCancelButton.click();
    
    // Wait for dialog to close
    await this.clearCartDialog.waitFor({ state: 'hidden', timeout: 10000 });
  }

  async getCartItemsCount(): Promise<number> {
    // Wait for any loading indicators to disappear
    const loadingIndicator = this.page.locator('.cx-spinner, .spinner, [class*="loading"]');
    await loadingIndicator.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {
      // No loading indicator, continue
    });
    
    // Wait for cart list to be stable
    const cartList = this.page.locator('cw-cart-item-list');
    await cartList.waitFor({ state: 'attached', timeout: 5000 }).catch(() => {
      // Cart might be empty
    });
    
    // Use waitForFunction to ensure count is stable (not changing)
    await this.page.waitForFunction(
      () => {
        const items = document.querySelectorAll('tr[cw-cart-item-list-row]');
        // Return true when items are present or when we're sure cart is empty
        return items.length > 0 || document.querySelector('cx-page-slot[position="EmptyCartMiddleContent"]') !== null;
      },
      { timeout: 5000 }
    ).catch(() => {
      // Timeout is ok, we'll count what's there
    });
    
    return await this.cartItems.count();
  }

  /**
   * Removes a cart item by SKU
   */
  async removeItemBySku(sku: string) {
    const itemRow = this.cartItems.filter({ has: this.page.locator('.cx-code', { hasText: sku }) });
    const removeButton = itemRow.locator('button.btn-close, button:has(cx-icon[type="CLOSE"])');
    await removeButton.click();
    // Wait for item to be removed from DOM
    await itemRow.waitFor({ state: 'detached', timeout: 10000 });
  }

  /**
   * Removes the first cart item
   */
  async removeFirstItem() {
    const initialCount = await this.getCartItemsCount();
    if (initialCount === 0) {
      throw new Error('Cannot remove item: cart is already empty');
    }
    
    // Get the SKU of the item we're about to remove for verification
    const firstItem = this.cartItems.first();
    const skuToRemove = await firstItem.locator('.cx-code').textContent();
    
    const removeButton = firstItem.locator('button.btn-close, button:has(cx-icon[type="CLOSE"])');
    await removeButton.waitFor({ state: 'visible', timeout: 5000 });
    await removeButton.click();
    
    // Wait for the specific item to be removed from DOM
    if (skuToRemove) {
      await this.page.waitForFunction(
        (sku) => {
          const items = document.querySelectorAll('tr[cw-cart-item-list-row]');
          for (const item of items) {
            const codeElement = item.querySelector('.cx-code');
            if (codeElement && codeElement.textContent?.trim() === sku.trim()) {
              return false; // Item still exists
            }
          }
          return true; // Item removed
        },
        skuToRemove,
        { timeout: 10000 }
      );
    }
    
    // getCartItemsCount() will handle waiting for cart to stabilize
    const newCount = await this.getCartItemsCount();
    const expectedCount = initialCount - 1;
    
    if (newCount !== expectedCount && newCount !== 0) {
      console.warn(`Warning: Expected ${expectedCount} items, but found ${newCount}`);
    }
    
    console.log(`Item removed. Cart now has ${newCount} item(s)`);
  }

  /**
   * Removes all items from the cart
   */
  async removeAllItems() {
    let itemCount = await this.getCartItemsCount();
    
    while (itemCount > 0) {
      await this.removeFirstItem();
      itemCount = await this.getCartItemsCount();
    }
    
    await this.expectCartEmpty();
  }

  /**
   * Extracts cart item data from a single product row
   */
  async getCartItemData(itemRow: Locator): Promise<CartItemData> {
    // Extract SKU
    const sku = await itemRow.locator('.cx-code').textContent();
    
    // Extract product name
    const name = await itemRow.locator('.cx-product-name a').textContent();
    
    // Extract prices - Retail and Cost
    const priceSection = itemRow.locator('td').nth(2);
    const retailText = await priceSection.locator('.info-wrapper:has-text("Retail:") .value').textContent();
    const costText = await priceSection.locator('.info-wrapper:has-text("Cost:") .value').textContent();
    
    // Extract quantity input
    const quantityInput = itemRow.locator('input[type="number"]');
    const quantityValue = await quantityInput.inputValue();
    
    // Extract Ship data (td index 4)
    const shipSection = itemRow.locator('td').nth(4);
    const shipQtyText = await shipSection.locator('.info-wrapper:has-text("Qty:") .value').textContent();
    const shipPriceText = await shipSection.locator('.info-wrapper:has-text("Price:") .value').textContent();
    
    // Extract BO data (td index 5)
    const boSection = itemRow.locator('td').nth(5);
    const boQtyText = await boSection.locator('.info-wrapper:has-text("Qty:") .value').textContent();
    const boPriceText = await boSection.locator('.info-wrapper:has-text("Price:") .value').textContent();
    
    // Extract total price (td index 6)
    const totalText = await itemRow.locator('td').nth(6).textContent();
    
    return {
      sku: sku?.trim() || '',
      name: name?.trim() || '',
      retailPrice: this.parsePrice(retailText),
      costPrice: this.parsePrice(costText),
      quantity: parseInt(quantityValue || '0'),
      shipQty: parseInt(shipQtyText?.trim() || '0'),
      shipPrice: this.parsePrice(shipPriceText),
      boQty: parseInt(boQtyText?.trim() || '0'),
      boPrice: this.parsePrice(boPriceText),
      totalPrice: this.parsePrice(totalText),
    };
  }

  /**
   * Gets all cart items data
   */
  async getAllCartItems(): Promise<CartItemData[]> {
    const items: CartItemData[] = [];
    const itemCount = await this.cartItems.count();
    
    for (let i = 0; i < itemCount; i++) {
      const itemRow = this.cartItems.nth(i);
      const itemData = await this.getCartItemData(itemRow);
      items.push(itemData);
    }
    
    return items;
  }

  /**
   * Helper method to parse price strings like "$16.56" to numbers
   */
  private parsePrice(priceText: string | null): number {
    if (!priceText) return 0;
    const cleanPrice = priceText.replace(/[$,\s]/g, '');
    return parseFloat(cleanPrice) || 0;
  }

  async expectErrorMessage(expectedText: string) {
    await expect(this.errorMessage).toBeVisible({ timeout: 10000 });
    await expect(this.errorMessage).toContainText(expectedText);
  }

  async expectProductInCart(productCode: string) {
    const productRow = this.cartItems.filter({
      has: this.page.locator('.cx-code', { hasText: productCode })
    });
    await expect(productRow).toBeVisible({ timeout: 5000 });
  }

  async expectOnlyProductInCart(productCode: string) {
    await expect(this.cartItems).toHaveCount(1);
    await this.expectProductInCart(productCode);
  }
}
