import { expect, type Locator, type Page } from '@playwright/test';

import type { Product } from '../data/catalog';

export class CartPage {
  readonly page: Page;
  readonly title: Locator;
  readonly cartList: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId('title');
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
    await expect(this.page).toHaveURL(/cart.html$/);
    await expect(this.title).toHaveText('Your Cart');
    await expect(this.cartList).toBeVisible();
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
