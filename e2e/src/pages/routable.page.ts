import type { Locator, Page } from '@playwright/test';

import { BasePage } from './base.page';

export abstract class RoutablePage extends BasePage {
  protected constructor(page: Page) {
    super(page);
  }

  protected abstract get path(): string;
  protected abstract get readyLocators(): readonly Locator[];

  async goto(): Promise<void> {
    await this.gotoPath(this.path);
    await this.expectReady();
  }

  async expectReady(): Promise<void> {
    await this.expectVisible(...this.readyLocators);
  }
}
