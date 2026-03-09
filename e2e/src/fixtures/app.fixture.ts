import { test as base } from '@playwright/test';

import type { Credentials } from '../data/users';
import { AppShellPage } from '../pages/app-shell.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { InventoryPage } from '../pages/inventory.page';
import { LoginPage } from '../pages/login.page';
import { ProductDetailsPage } from '../pages/product-details.page';

interface AppFixtures {
  appShellPage: AppShellPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  inventoryPage: InventoryPage;
  loginAs: (credentials: Credentials) => Promise<void>;
  loginPage: LoginPage;
  productDetailsPage: ProductDetailsPage;
}

export const test = base.extend<AppFixtures>({
  appShellPage: async ({ page }, use) => {
    await use(new AppShellPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  loginAs: async ({ loginPage }, use) => {
    await use(async (credentials: Credentials) => {
      await loginPage.goto();
      await loginPage.login(credentials);
    });
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  productDetailsPage: async ({ page }, use) => {
    await use(new ProductDetailsPage(page));
  },
});

export { expect } from '@playwright/test';
