import { expect, type Locator, type Page } from '@playwright/test';

import type { Product } from '../data/catalog';
import { AppShellPage } from './app-shell.page';

export class CartPage extends AppShellPage {
  readonly cartList: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cartList = page.getByTestId('cart-list');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
    this.checkoutButton = page.getByTestId('checkout');
  }

  itemName(product: Product): Locator {
    return this.page.getByTestId('inventory-item-name').filter({
      hasText: product.name,
    });
  }

  removeButton(product: Product): Locator {
    return this.page.getByTestId(`remove-${product.slug}`);
  }

  async expectLoaded(): Promise<void> {
    await this.expectCurrentUrl(/cart.html$/);
    await this.expectPageTitle('Your Cart');
    await this.expectVisible(this.cartList);
  }

  async expectProductsInCart(products: readonly Product[]): Promise<void> {
    for (const product of products) {
      await expect(this.itemName(product)).toBeVisible();
    }
  }

  async expectProductNotInCart(product: Product): Promise<void> {
    await expect(this.itemName(product)).toHaveCount(0);
  }

  async removeProduct(product: Product): Promise<void> {
    await this.removeButton(product).click();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  async startCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
