import { loginTest as test, expect } from '../../fixtures/test-fixtures';

test('user can log in and log out successfully @smoke', async ({ page, loginPage, boardPage, logoutPage }) => {
  await test.step('Login', async () => {
    await loginPage.goto();
    await loginPage.login(process.env.TRELLO_EMAIL!, process.env.TRELLO_PASSWORD!);
    await loginPage.skipTwoStepVerification();
    await loginPage.page.waitForURL('**/boards');
  });

  await test.step('Logout', async () => {
    await boardPage.gotoAccounts();
    await boardPage.logout();
    await logoutPage.logoutSubmit();
    await expect(page).toHaveURL("https://trello.com/");
    expect(await loginPage.isSignUpButtonVisible()).toBeTruthy();
  });
});

test.describe('Login - Negative scenarios @regression', () => {

  test('shows error for empty email', async ({ loginPage }) => {
    await test.step('Submit empty email', async () => {
      await loginPage.goto();
      await loginPage.submitEmail('');
    });

    await test.step('Verify error message', async () => {
      await loginPage.expectLoginError(
        /Enter an email address/i);
    });

  });

  test('shows error for invalid email format', async ({ loginPage }) => {
    await test.step('Submit invalid email', async () => {
      await loginPage.goto();
      await loginPage.submitEmail('invalid-email');
    });

    await test.step('Verify error message', async () => {
      await loginPage.expectLoginError(/Email address must contain text before and after an '@' symbol/i);
    });

  });

});