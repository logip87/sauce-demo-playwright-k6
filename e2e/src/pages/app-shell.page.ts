import { expect, type Locator, type Page } from '@playwright/test';

import { socialLinks } from '../data/catalog';

export class AppShellPage {
  readonly page: Page;
  readonly openMenuButton: Locator;
  readonly closeMenuButton: Locator;
  readonly allItemsSidebarLink: Locator;
  readonly aboutSidebarLink: Locator;
  readonly logoutSidebarLink: Locator;
  readonly resetSidebarLink: Locator;
  readonly shoppingCartLink: Locator;
  readonly shoppingCartBadge: Locator;
  readonly twitterFooterLink: Locator;
  readonly facebookFooterLink: Locator;
  readonly linkedinFooterLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.openMenuButton = page.locator('button').filter({
      has: page.getByTestId('open-menu'),
    });
    this.closeMenuButton = page.locator('button').filter({
      has: page.getByTestId('close-menu'),
    });
    this.allItemsSidebarLink = page.getByTestId('inventory-sidebar-link');
    this.aboutSidebarLink = page.getByTestId('about-sidebar-link');
    this.logoutSidebarLink = page.getByTestId('logout-sidebar-link');
    this.resetSidebarLink = page.getByTestId('reset-sidebar-link');
    this.shoppingCartLink = page.getByTestId('shopping-cart-link');
    this.shoppingCartBadge = page.getByTestId('shopping-cart-badge');
    this.twitterFooterLink = page.getByTestId('social-twitter');
    this.facebookFooterLink = page.getByTestId('social-facebook');
    this.linkedinFooterLink = page.getByTestId('social-linkedin');
  }

  async openMenu(): Promise<void> {
    await this.openMenuButton.click();
    await expect(this.logoutSidebarLink).toBeVisible();
  }

  async closeMenu(): Promise<void> {
    await this.closeMenuButton.click();
    await expect(this.logoutSidebarLink).toBeHidden();
  }

  async logout(): Promise<void> {
    await this.openMenu();
    await this.logoutSidebarLink.click();
    await expect(this.page).toHaveURL(/\/$/);
  }

  async resetAppState(): Promise<void> {
    await this.openMenu();
    await this.resetSidebarLink.click();
  }

  async navigateToAllItems(): Promise<void> {
    await this.openMenu();
    await this.allItemsSidebarLink.click();
  }

  async openCart(): Promise<void> {
    await this.shoppingCartLink.click();
  }

  async expectCartCount(count: number): Promise<void> {
    await expect(this.shoppingCartBadge).toHaveText(String(count));
  }

  async expectCartEmpty(): Promise<void> {
    await expect(this.shoppingCartBadge).toBeHidden();
  }

  async expectFooterLinks(): Promise<void> {
    await expect(this.twitterFooterLink).toHaveAttribute('href', socialLinks.twitter);
    await expect(this.facebookFooterLink).toHaveAttribute('href', socialLinks.facebook);
    await expect(this.linkedinFooterLink).toHaveAttribute('href', socialLinks.linkedin);
  }
}
