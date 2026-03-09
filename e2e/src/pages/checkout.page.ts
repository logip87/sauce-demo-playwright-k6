import { expect, type Locator, type Page } from '@playwright/test';

import type { Product } from '../data/catalog';
import type { CheckoutDetails } from '../data/checkout';
import { formatCurrency, parseCurrency } from '../utils/currency';

export interface CheckoutTotals {
  itemTotal: number;
  tax: number;
  total: number;
}

export class CheckoutPage {
  readonly page: Page;
  readonly title: Locator;
  readonly errorBanner: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly cancelButton: Locator;
  readonly continueButton: Locator;
  readonly finishButton: Locator;
  readonly paymentInfoValue: Locator;
  readonly shippingInfoValue: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly completeHeader: Locator;
  readonly completeText: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId('title');
    this.errorBanner = page.getByTestId('error');
    this.firstNameInput = page.getByTestId('firstName');
    this.lastNameInput = page.getByTestId('lastName');
    this.postalCodeInput = page.getByTestId('postalCode');
    this.cancelButton = page.getByTestId('cancel');
    this.continueButton = page.getByTestId('continue');
    this.finishButton = page.getByTestId('finish');
    this.paymentInfoValue = page.getByTestId('payment-info-value');
    this.shippingInfoValue = page.getByTestId('shipping-info-value');
    this.subtotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
    this.completeHeader = page.getByTestId('complete-header');
    this.completeText = page.getByTestId('complete-text');
    this.backHomeButton = page.getByTestId('back-to-products');
  }

  overviewItemName(product: Product): Locator {
    return this.page.getByTestId('inventory-item-name').filter({
      hasText: product.name,
    });
  }

  async expectInformationStep(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout-step-one.html$/);
    await expect(this.title).toHaveText('Checkout: Your Information');
    await expect(this.firstNameInput).toBeVisible();
  }

  async continueWith(details: CheckoutDetails): Promise<void> {
    await this.firstNameInput.fill(details.firstName);
    await this.lastNameInput.fill(details.lastName);
    await this.postalCodeInput.fill(details.postalCode);
    await this.continueButton.click();
  }

  async submitInformation(): Promise<void> {
    await this.continueButton.click();
  }

  async expectValidationError(message: string): Promise<void> {
    await expect(this.errorBanner).toContainText(message);
  }

  async cancelInformation(): Promise<void> {
    await this.cancelButton.click();
  }

  async expectOverviewStep(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout-step-two.html$/);
    await expect(this.title).toHaveText('Checkout: Overview');
    await expect(this.finishButton).toBeVisible();
  }

  async expectOverviewProducts(products: readonly Product[]): Promise<void> {
    for (const product of products) {
      await expect(this.overviewItemName(product)).toBeVisible();
    }
  }

  async expectOverviewMeta(): Promise<void> {
    await expect(this.paymentInfoValue).toHaveText('SauceCard #31337');
    await expect(this.shippingInfoValue).toHaveText('Free Pony Express Delivery!');
  }

  async expectTotals(totals: CheckoutTotals): Promise<void> {
    await expect(this.subtotalLabel).toHaveText(`Item total: $${formatCurrency(totals.itemTotal)}`);
    await expect(this.taxLabel).toHaveText(`Tax: $${formatCurrency(totals.tax)}`);
    await expect(this.totalLabel).toHaveText(`Total: $${formatCurrency(totals.total)}`);
  }

  async readTotals(): Promise<CheckoutTotals> {
    return {
      itemTotal: parseCurrency(await this.subtotalLabel.textContent() ?? ''),
      tax: parseCurrency(await this.taxLabel.textContent() ?? ''),
      total: parseCurrency(await this.totalLabel.textContent() ?? ''),
    };
  }

  async cancelOverview(): Promise<void> {
    await this.cancelButton.click();
  }

  async finishCheckout(): Promise<void> {
    await this.finishButton.click();
  }

  async expectCompleteStep(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout-complete.html$/);
    await expect(this.title).toHaveText('Checkout: Complete!');
    await expect(this.completeHeader).toHaveText('Thank you for your order!');
    await expect(this.completeText).toContainText('Your order has been dispatched');
  }

  async backHome(): Promise<void> {
    await this.backHomeButton.click();
  }
}
