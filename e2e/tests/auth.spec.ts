import { test } from '../src/fixtures/app.fixture';
import { activeUsers, loginErrorMessages, users } from '../src/data/users';

const loginValidationCases = [
  {
    name: 'a missing username',
    credentials: {
      password: users.standard.password,
    },
    expectedMessage: loginErrorMessages.usernameRequired,
  },
  {
    name: 'a missing password',
    credentials: {
      username: users.standard.username,
    },
    expectedMessage: loginErrorMessages.passwordRequired,
  },
] as const;

for (const user of activeUsers) {
  test(`allows ${user.username} to reach the inventory page`, async ({ inventoryPage, loginAs, loginPage }) => {
    if (user.username === users.performanceGlitch.username) {
      test.slow();
    }

    await loginAs(user);

    await loginPage.expectLoginSuccess();
    await inventoryPage.expectLoaded();
  });
}

test('shows the locked-out error for a blocked user', async ({ loginPage }) => {
  await loginPage.goto();
  await loginPage.login(users.lockedOut);

  await loginPage.expectError(loginErrorMessages.lockedOut);
});

test('rejects invalid credentials', async ({ loginPage }) => {
  await loginPage.goto();
  await loginPage.login(users.invalid);

  await loginPage.expectError(loginErrorMessages.invalidCredentials);
});

for (const scenario of loginValidationCases) {
  test(`validates ${scenario.name}`, async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.fillCredentials(scenario.credentials);
    await loginPage.submit();

    await loginPage.expectError(scenario.expectedMessage);
  });
}
