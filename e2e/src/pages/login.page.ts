import { expect, type Locator, type Page } from '@playwright/test';

import type { Credentials } from '../data/users';
import { RoutablePage } from './routable.page';

export class LoginPage extends RoutablePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorBanner: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByTestId('username');
    this.passwordInput = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.errorBanner = page.getByTestId('error');
  }

  protected override get path(): string {
    return '/';
  }

  protected override get readyLocators(): readonly Locator[] {
    return [this.usernameInput, this.loginButton];
  }

  async fillCredentials(credentials: Partial<Credentials>): Promise<void> {
    await this.usernameInput.fill(credentials.username ?? '');
    await this.passwordInput.fill(credentials.password ?? '');
  }

  async submit(): Promise<void> {
    await this.loginButton.click();
  }

  async login(credentials: Credentials): Promise<void> {
    await this.fillCredentials(credentials);
    await this.submit();
  }

  async expectLoginSuccess(): Promise<void> {
    await this.expectCurrentUrl(/inventory.html$/);
  }

  async expectError(message: string): Promise<void> {
    await expect(this.errorBanner).toContainText(message);
    await expect(this.errorBanner).toBeVisible();
  }
}
