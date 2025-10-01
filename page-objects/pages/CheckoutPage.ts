import { Page, Locator, expect } from '@playwright/test';

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

  async fillDeliveryModeDetails(year: string, dayLabel: string, dayText: string, poNumber: string) {
    // Set order cancel date
    await this.orderCancelDateInput.waitFor({ state: 'visible' });
    await this.orderCancelDateInput.click();
    await this.yearSelect.selectOption(year);
    // Click the specific day in the calendar
    await this.page.getByLabel(dayLabel).getByText(dayText).click();
    
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
