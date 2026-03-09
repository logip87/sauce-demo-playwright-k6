import { test } from '../src/fixtures/app.fixture';
import { products } from '../src/data/catalog';
import { checkoutDetails, checkoutValidationMessages } from '../src/data/checkout';
import { users } from '../src/data/users';
import { roundCurrency } from '../src/utils/currency';

const checkoutValidationCases = [
  {
    name: 'a first name',
    details: {
      ...checkoutDetails,
      firstName: '',
    },
    expectedMessage: checkoutValidationMessages.firstNameRequired,
  },
  {
    name: 'a last name',
    details: {
      ...checkoutDetails,
      lastName: '',
    },
    expectedMessage: checkoutValidationMessages.lastNameRequired,
  },
  {
    name: 'a postal code',
    details: {
      ...checkoutDetails,
      postalCode: '',
    },
    expectedMessage: checkoutValidationMessages.postalCodeRequired,
  },
] as const;

test.beforeEach(async ({ inventoryPage, loginAs }) => {
  await loginAs(users.standard);
  await inventoryPage.expectLoaded();
});

test('adds a product to the cart and starts checkout', async ({
  appShellPage,
  cartPage,
  checkoutPage,
  inventoryPage,
}) => {
  await inventoryPage.addProductToCart(products.backpack);
  await appShellPage.expectCartCount(1);
  await appShellPage.openCart();

  await cartPage.expectLoaded();
  await cartPage.expectProductsInCart([products.backpack]);
  await cartPage.startCheckout();

  await checkoutPage.expectInformationStep();
  await checkoutPage.continueWith(checkoutDetails);
  await checkoutPage.expectOverviewStep();
});

for (const scenario of checkoutValidationCases) {
  test(`requires ${scenario.name} before checkout can continue`, async ({
    appShellPage,
    cartPage,
    checkoutPage,
    inventoryPage,
  }) => {
    await inventoryPage.addProductToCart(products.backpack);
    await appShellPage.openCart();
    await cartPage.startCheckout();

    await checkoutPage.expectInformationStep();
    await checkoutPage.continueWith(scenario.details);
    await checkoutPage.expectValidationError(scenario.expectedMessage);
  });
}

test('returns to the cart when checkout information is cancelled', async ({
  appShellPage,
  cartPage,
  checkoutPage,
  inventoryPage,
}) => {
  await inventoryPage.addProductToCart(products.backpack);
  await appShellPage.openCart();
  await cartPage.startCheckout();

  await checkoutPage.expectInformationStep();
  await checkoutPage.cancelInformation();

  await cartPage.expectLoaded();
});

test('returns to the inventory when checkout overview is cancelled', async ({
  appShellPage,
  cartPage,
  checkoutPage,
  inventoryPage,
}) => {
  await inventoryPage.addProductToCart(products.backpack);
  await appShellPage.openCart();
  await cartPage.startCheckout();
  await checkoutPage.continueWith(checkoutDetails);

  await checkoutPage.expectOverviewStep();
  await checkoutPage.cancelOverview();

  await inventoryPage.expectLoaded();
});

test('shows correct totals and completes the checkout flow', async ({
  appShellPage,
  cartPage,
  checkoutPage,
  inventoryPage,
}) => {
  const itemTotal = products.backpack.price + products.bikeLight.price;
  const tax = roundCurrency(itemTotal * 0.08);
  const total = roundCurrency(itemTotal + tax);

  await inventoryPage.addProductToCart(products.backpack);
  await inventoryPage.addProductToCart(products.bikeLight);
  await appShellPage.expectCartCount(2);
  await appShellPage.openCart();

  await cartPage.expectLoaded();
  await cartPage.startCheckout();
  await checkoutPage.continueWith(checkoutDetails);

  await checkoutPage.expectOverviewStep();
  await checkoutPage.expectOverviewProducts([products.backpack, products.bikeLight]);
  await checkoutPage.expectOverviewMeta();
  await checkoutPage.expectTotals({
    itemTotal,
    tax,
    total,
  });
  await checkoutPage.finishCheckout();

  await checkoutPage.expectCompleteStep();
  await checkoutPage.backHome();

  await inventoryPage.expectLoaded();
  await appShellPage.expectCartEmpty();
});
