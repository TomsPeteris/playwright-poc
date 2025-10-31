import { Locator, Page, expect } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;
  readonly continueButton: Locator;
  readonly placeOrderButton: Locator;
  readonly deliveryAddressSection: Locator;
  readonly deliveryModeSection: Locator;
  readonly paymentSection: Locator;
  readonly reviewSection: Locator;
  readonly orderCancelDateInput: Locator;
  readonly yearSelect: Locator;
  readonly monthSelect: Locator;
  readonly poNumberInput: Locator;
  readonly termsAndConditionsCheckbox: Locator;
  readonly thankYouMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.continueButton = page.getByRole('button', { name: /continue/i });
    this.placeOrderButton = page.getByRole('button', { name: /place order/i });
    this.deliveryAddressSection = page.locator('cx-delivery-address');
    this.deliveryModeSection = page.locator('cx-delivery-mode');
    this.paymentSection = page.locator('cx-payment-method');
    this.reviewSection = page.locator('cx-review-submit');
    this.orderCancelDateInput = page.getByRole('textbox', { name: 'Order Cancel Date' });
    this.yearSelect = page.getByLabel('Select year');
    this.monthSelect = page.locator('select[aria-label="Select month"]');
    this.poNumberInput = page.getByRole('textbox', { name: 'P.O. Number' });
    this.termsAndConditionsCheckbox = page.locator('input[formcontrolname="termsAndConditions"]');
    this.thankYouMessage = page.locator('cw-order-confirmation-thank-you-message');
  }

  async expectCheckoutUrl() {
    await expect(this.page).toHaveURL(/\/checkout/);
  }

  async expectDeliveryAddressStep() {
    await expect(this.page).toHaveURL(/\/checkout\/delivery-address/);
  }

  async expectDeliveryModeStep() {
    await expect(this.page).toHaveURL(/\/checkout\/delivery-mode/);
  }

  async expectReviewOrderStep() {
    await expect(this.page).toHaveURL(/\/checkout\/review-order/);
  }

  async expectOrderConfirmationPage() {
    await expect(this.page).toHaveURL(/\/order-confirmation/);
    await expect(this.thankYouMessage).toBeVisible();
    await expect(this.thankYouMessage).toContainText(/thank you for your order/i);
  }

  async continueFromDeliveryAddress() {
    await this.continueButton.waitFor({ state: 'visible' });
    await this.continueButton.click();
    // Wait for navigation to delivery mode step
    await this.page.waitForURL(/\/checkout\/delivery-mode/);
  }

  async fillDeliveryModeDetails(poNumber: string) {
    const today = new Date();
    // Select 3 months from the current day
    const futureDate = new Date(today);
    futureDate.setMonth(futureDate.getMonth() + 3);

    const year = futureDate.getFullYear().toString();
    const monthValue = (futureDate.getMonth() + 1).toString();
    const day = futureDate.getDate().toString();
    const weekday = futureDate.toLocaleString('en-US', { weekday: 'long' });
    const monthFull = futureDate.toLocaleString('en-US', { month: 'long' });
    const dayLabel = `${weekday}, ${monthFull} ${day}, ${year}`;

    await this.orderCancelDateInput.waitFor({ state: 'visible' });
    await this.orderCancelDateInput.click();

    await this.yearSelect.selectOption(year);
    await this.monthSelect.selectOption(monthValue);

    // Wait for the date grid to refresh
    await this.page.waitForTimeout(300);
    // Locate the correct grid cell
    const dayCell = this.page.locator(`div[role="gridcell"][aria-label="${dayLabel}"] div`);

    await dayCell.first().click();
    
    // Fill PO number
    await this.poNumberInput.waitFor({ state: 'visible' });
    await this.poNumberInput.click();
    await this.poNumberInput.fill(poNumber);
  }

  async continueFromDeliveryMode() {
    await this.continueButton.waitFor({ state: 'visible' });
    await this.continueButton.click();
    // Wait for navigation to review order step
    await this.page.waitForURL(/\/checkout\/review-order/);
  }

  async acceptTermsAndConditions() {
    await this.termsAndConditionsCheckbox.waitFor({ state: 'visible' });
    await this.termsAndConditionsCheckbox.check();
  }

  async placeOrder() {
    await this.placeOrderButton.waitFor({ state: 'visible' });
    await this.placeOrderButton.click();
    // Wait for navigation to order confirmation
    await this.page.waitForURL(/\/order-confirmation/, { timeout: 30000 });
  }
}
