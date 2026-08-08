import { Page, Locator, expect } from '@playwright/test';

export class LogOutPage {
  readonly page: Page;

  // Locators
  readonly logoutSubmitButton:Locator;

  constructor(page: Page) {
    this.page = page;
    this.logoutSubmitButton=page.getByRole('button',{name:'Log out'})
    
  }

async logoutSubmit() {
  await this.logoutSubmitButton.waitFor({ state: 'visible'});
  await this.logoutSubmitButton.click();
}

}