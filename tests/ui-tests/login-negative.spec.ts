import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Login - Negative scenarios @regression ', () => {

  test('shows error for non-existent email @smoke', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.submitEmail('doesnotexist_' + Date.now() + '@example.com');
    await loginPage.expectLoginError(/couldn.?t find an account/i);
  });

  test('shows error for invalid email format', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.submitEmail('not-an-email');
    await loginPage.expectLoginError(/valid email/i);
  });
  

});