import { expect, type Locator, type Page } from '@playwright/test';

import type { Product } from '../data/catalog';
import { AppShellPage } from './app-shell.page';

export class ProductDetailsPage extends AppShellPage {
  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;
  readonly backToProductsButton: Locator;

  constructor(page: Page) {
    super(page);
    this.name = page.getByTestId('inventory-item-name');
    this.description = page.getByTestId('inventory-item-desc');
    this.price = page.getByTestId('inventory-item-price');
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.removeButton = page.getByTestId('remove');
    this.backToProductsButton = page.getByTestId('back-to-products');
  }

  async expectLoaded(product: Product): Promise<void> {
    await this.expectCurrentUrl(new RegExp(`inventory-item\\.html\\?id=${product.id}$`));
    await expect(this.name).toHaveText(product.name);
  }

  async expectProductDetails(product: Product): Promise<void> {
    await expect(this.name).toHaveText(product.name);
    await expect(this.description).toHaveText(product.description);
    await expect(this.price).toHaveText(`$${product.price.toFixed(2)}`);
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  async expectMarkedInCart(): Promise<void> {
    await expect(this.removeButton).toBeVisible();
  }

  async goBackToProducts(): Promise<void> {
    await this.backToProductsButton.click();
  }
}
