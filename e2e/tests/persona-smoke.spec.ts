import { test } from '../src/fixtures/app.fixture';
import { checkoutDetails } from '../src/data/checkout';
import { products } from '../src/data/catalog';
import { successfulLoginUsers } from '../src/data/users';
import { roundCurrency } from '../src/utils/currency';

for (const user of successfulLoginUsers) {
  test(`keeps product details stable for ${user.username}`, async ({
    appShellPage,
    inventoryPage,
    loginAs,
    productDetailsPage,
  }) => {
    await loginAs(user);
    await inventoryPage.expectLoaded();

    await inventoryPage.openProduct(products.backpack);

    await productDetailsPage.expectLoaded(products.backpack);
    await productDetailsPage.expectProductDetails(products.backpack);
    await productDetailsPage.addToCart();
    await productDetailsPage.expectMarkedInCart();
    await appShellPage.expectCartCount(1);
  });

  test(`completes a checkout for ${user.username}`, async ({
    appShellPage,
    cartPage,
    checkoutPage,
    inventoryPage,
    loginAs,
  }) => {
    const itemTotal = products.backpack.price + products.bikeLight.price;
    const tax = roundCurrency(itemTotal * 0.08);
    const total = roundCurrency(itemTotal + tax);

    await loginAs(user);
    await inventoryPage.expectLoaded();

    await inventoryPage.addProductToCart(products.backpack);
    await inventoryPage.addProductToCart(products.bikeLight);
    await appShellPage.expectCartCount(2);
    await appShellPage.openCart();

    await cartPage.expectLoaded();
    await cartPage.expectProductsInCart([products.backpack, products.bikeLight]);
    await cartPage.startCheckout();
    await checkoutPage.expectInformationStep();
    await checkoutPage.continueWith(checkoutDetails);
    await checkoutPage.expectOverviewStep();
    await checkoutPage.expectOverviewProducts([products.backpack, products.bikeLight]);
    await checkoutPage.expectTotals({
      itemTotal,
      tax,
      total,
    });
    await checkoutPage.finishCheckout();
    await checkoutPage.expectCompleteStep();
  });
}
