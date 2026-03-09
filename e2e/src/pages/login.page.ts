import { expect, type Locator, type Page } from '@playwright/test';

import type { Credentials } from '../data/users';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorBanner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByTestId('username');
    this.passwordInput = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-button');
    this.errorBanner = page.getByTestId('error');
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.expectReady();
  }

  async expectReady(): Promise<void> {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
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
    await expect(this.page).toHaveURL(/inventory.html$/);
  }

  async expectError(message: string): Promise<void> {
    await expect(this.errorBanner).toContainText(message);
    await expect(this.errorBanner).toBeVisible();
  }
}
