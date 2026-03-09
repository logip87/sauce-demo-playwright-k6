import { expect, type Locator, type Page } from '@playwright/test';

import type { Product } from '../data/catalog';
import { parseCurrency } from '../utils/currency';

export class InventoryPage {
  readonly page: Page;
  readonly title: Locator;
  readonly inventoryContainer: Locator;
  readonly inventoryItems: Locator;
  readonly inventoryItemNames: Locator;
  readonly inventoryItemPrices: Locator;
  readonly sortDropdown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByTestId('title');
    this.inventoryContainer = page.getByTestId('inventory-container');
    this.inventoryItems = page.getByTestId('inventory-item');
    this.inventoryItemNames = page.getByTestId('inventory-item-name');
    this.inventoryItemPrices = page.getByTestId('inventory-item-price');
    this.sortDropdown = page.getByTestId('product-sort-container');
  }

  addToCartButton(product: Product): Locator {
    return this.page.getByTestId(`add-to-cart-${product.slug}`);
  }

  removeButton(product: Product): Locator {
    return this.page.getByTestId(`remove-${product.slug}`);
  }

  productTitleLink(product: Product): Locator {
    return this.page.getByTestId(`item-${product.id}-title-link`);
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(/inventory.html$/);
    await expect(this.title).toHaveText('Products');
    await expect(this.inventoryContainer).toBeVisible();
  }

  async expectCatalogVisible(products: readonly Product[]): Promise<void> {
    await expect(this.inventoryItems).toHaveCount(products.length);
    await expect(this.inventoryItemNames).toHaveText(products.map((product) => product.name));
  }

  async addProductToCart(product: Product): Promise<void> {
    await this.addToCartButton(product).click();
  }

  async removeProductFromCart(product: Product): Promise<void> {
    await this.removeButton(product).click();
  }

  async expectProductMarkedInCart(product: Product): Promise<void> {
    await expect(this.removeButton(product)).toBeVisible();
  }

  async expectProductReadyToAdd(product: Product): Promise<void> {
    await expect(this.addToCartButton(product)).toBeVisible();
  }

  async openProduct(product: Product): Promise<void> {
    await this.productTitleLink(product).click();
  }

  async sortBy(optionLabel: string): Promise<void> {
    await this.sortDropdown.selectOption({ label: optionLabel });
  }

  async getVisibleProductNames(): Promise<string[]> {
    return (await this.inventoryItemNames.allTextContents()).map((name) => name.trim());
  }

  async getVisibleProductPrices(): Promise<number[]> {
    const prices = await this.inventoryItemPrices.allTextContents();
    return prices.map((price) => parseCurrency(price));
  }
}
