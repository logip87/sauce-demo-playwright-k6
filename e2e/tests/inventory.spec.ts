import { expect, test } from '../src/fixtures/app.fixture';
import {
  catalog,
  productNamesAToZ,
  productNamesZToA,
  productPricesHighToLow,
  productPricesLowToHigh,
  products,
} from '../src/data/catalog';
import { users } from '../src/data/users';

test.beforeEach(async ({ inventoryPage, loginAs }) => {
  await loginAs(users.standard);
  await inventoryPage.expectLoaded();
});

test('shows the full product catalog and footer links', async ({ appShellPage, inventoryPage }) => {
  await inventoryPage.expectCatalogVisible(catalog);
  await appShellPage.expectFooterLinks();
});

test('supports all sort options', async ({ inventoryPage }) => {
  await inventoryPage.sortBy('Name (A to Z)');
  expect(await inventoryPage.getVisibleProductNames()).toEqual(productNamesAToZ);

  await inventoryPage.sortBy('Name (Z to A)');
  expect(await inventoryPage.getVisibleProductNames()).toEqual(productNamesZToA);

  await inventoryPage.sortBy('Price (low to high)');
  expect(await inventoryPage.getVisibleProductPrices()).toEqual(productPricesLowToHigh);

  await inventoryPage.sortBy('Price (high to low)');
  expect(await inventoryPage.getVisibleProductPrices()).toEqual(productPricesHighToLow);
});

test('adds and removes items directly from the inventory list', async ({ appShellPage, inventoryPage }) => {
  await inventoryPage.addProductToCart(products.backpack);
  await inventoryPage.expectProductMarkedInCart(products.backpack);

  await inventoryPage.addProductToCart(products.bikeLight);
  await inventoryPage.expectProductMarkedInCart(products.bikeLight);
  await appShellPage.expectCartCount(2);

  await inventoryPage.removeProductFromCart(products.bikeLight);
  await inventoryPage.expectProductReadyToAdd(products.bikeLight);
  await appShellPage.expectCartCount(1);

  await inventoryPage.removeProductFromCart(products.backpack);
  await inventoryPage.expectProductReadyToAdd(products.backpack);
  await appShellPage.expectCartEmpty();
});

test('opens product details and returns to the inventory view', async ({
  appShellPage,
  inventoryPage,
  productDetailsPage,
}) => {
  await inventoryPage.openProduct(products.backpack);

  await productDetailsPage.expectLoaded(products.backpack);
  await productDetailsPage.expectProductDetails(products.backpack);
  await productDetailsPage.addToCart();
  await productDetailsPage.expectMarkedInCart();
  await appShellPage.expectCartCount(1);

  await productDetailsPage.goBackToProducts();

  await inventoryPage.expectLoaded();
  await inventoryPage.expectProductMarkedInCart(products.backpack);
});

test('logs out through the side menu', async ({ appShellPage, loginPage }) => {
  await appShellPage.logout();

  await loginPage.expectReady();
});

test('resets the app state through the side menu', async ({ appShellPage, inventoryPage }) => {
  await inventoryPage.addProductToCart(products.backpack);
  await appShellPage.expectCartCount(1);

  await appShellPage.resetAppState();
  await appShellPage.closeMenu();

  await appShellPage.expectCartEmpty();
  await inventoryPage.expectProductReadyToAdd(products.backpack);
});
