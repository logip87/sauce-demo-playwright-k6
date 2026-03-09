import { expect, type Locator, type Page } from '@playwright/test';

export abstract class BasePage {
  readonly page: Page;

  protected constructor(page: Page) {
    this.page = page;
  }

  protected async expectCurrentUrl(urlPattern: RegExp): Promise<void> {
    await expect(this.page).toHaveURL(urlPattern);
  }

  protected async expectVisible(...locators: readonly Locator[]): Promise<void> {
    for (const locator of locators) {
      await expect(locator).toBeVisible();
    }
  }

  protected async gotoPath(path: string): Promise<void> {
    await this.page.goto(path);
  }
}
