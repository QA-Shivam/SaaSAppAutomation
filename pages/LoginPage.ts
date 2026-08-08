import { Page, Locator, expect } from '@playwright/test';
import { th } from 'framer-motion/client';

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
  readonly skipTwoStepVerificationButton:Locator;
  readonly loginLink:Locator;
  readonly signupButton:Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByPlaceholder('Enter your email');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.passwordInput = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: 'Log in' });
    this.loginLink = page.getByRole('link', { name: 'Log in' });
    this.errorMessage = page.locator('[data-testid*="invalid-error-message-"]'); 
    this.googleLoginButton = page.getByRole('button', { name: /Continue with Google/i });
    this.forgotPasswordLink = page.getByRole('link', { name: 'Can\u2019t log in?' });
    this.skipTwoStepVerificationButton=page.getByRole('button',{name:'Continue without two-step verification'})
    this.signupButton = page.getByRole('button', {name: 'Sign up for Trello - it’s free!'});
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

   async skipTwoStepVerification() {
    const isVisible = await this.skipTwoStepVerificationButton.isVisible({ timeout: 5000 }).catch(() => false);
  if (isVisible) {
    await this.skipTwoStepVerificationButton.click();
  }
}

async isLoginLinkVisible():Promise<boolean>{
  return await this.loginLink.isVisible();
}

async isSignUpButtonVisible():Promise<boolean>{
  await this.signupButton.first().waitFor({ state: 'visible'});
  return await this.signupButton.first().isVisible();
}
}