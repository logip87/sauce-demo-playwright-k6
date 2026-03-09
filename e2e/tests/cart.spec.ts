import { test } from '../src/fixtures/app.fixture';
import { products } from '../src/data/catalog';
import { users } from '../src/data/users';

test.beforeEach(async ({ inventoryPage, loginAs }) => {
  await loginAs(users.standard);
  await inventoryPage.expectLoaded();
});

test('shows selected items in the cart and supports continue shopping', async ({
  appShellPage,
  cartPage,
  inventoryPage,
}) => {
  await inventoryPage.addProductToCart(products.backpack);
  await inventoryPage.addProductToCart(products.bikeLight);
  await appShellPage.expectCartCount(2);

  await appShellPage.openCart();

  await cartPage.expectLoaded();
  await cartPage.expectProductsInCart([products.backpack, products.bikeLight]);

  await cartPage.removeProduct(products.bikeLight);
  await cartPage.expectProductNotInCart(products.bikeLight);
  await appShellPage.expectCartCount(1);

  await cartPage.continueShopping();

  await inventoryPage.expectLoaded();
  await inventoryPage.expectProductMarkedInCart(products.backpack);
});
