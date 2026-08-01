import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;

  // Locators
  readonly emailInput: Locator;
  readonly continueButton: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly googleLoginButton: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByPlaceholder('Enter your email');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.passwordInput = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: 'Log in' });
    this.errorMessage = page.getByTestId('error-message'); // adjust once you inspect actual DOM
    this.googleLoginButton = page.getByRole('button', { name: /Continue with Google/i });
    this.forgotPasswordLink = page.getByRole('link', { name: 'Can\u2019t log in?' });
  }

async goto() {
  await this.page.goto('/login', { waitUntil: 'commit' });
}

 
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.continueButton.click();

    await this.passwordInput.waitFor({ state: 'visible' });
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async submitEmail(email: string) {
    await this.emailInput.fill(email);
    await this.continueButton.click();
  }

  
   async submitPassword(password: string) {
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorMessage(): Promise<string> {
    await this.errorMessage.waitFor({ state: 'visible' });
    return this.errorMessage.innerText();
  }

  async expectLoginError(expectedText: string | RegExp) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toHaveText(expectedText);
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      await this.page.waitForURL('**/boards/**', { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  async loginWithGoogle() {
    const [popup] = await Promise.all([
      this.page.waitForEvent('popup'),
      this.googleLoginButton.click(),
    ]);
    return popup; // caller handles the Google-hosted login form in this popup page
  }
}