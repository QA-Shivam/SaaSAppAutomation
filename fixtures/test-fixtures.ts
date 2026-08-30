// fixtures/test-fixtures.ts

import { test as base, expect, BrowserContext } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { WorkspacePage } from '../pages/WorkspacePage';
import { BoardPage } from '../pages/BoardPage';
import { CardModal } from '../pages/CardModal';
import { TrelloApiClient } from '../utils/apiClient';
import { LogOutPage } from '../pages/LogOutPage';

// 1. Worker-scoped fixtures — created ONCE per worker process, shared by all tests in that worker
type MyWorkerFixtures = {
  authenticatedContext: BrowserContext;
};

// 2. Test-scoped fixtures — fresh instance per individual test
type MyTestFixtures = {
  loginPage: LoginPage;
  workspacePage: WorkspacePage;
  boardPage: BoardPage;
  cardModal: CardModal;
  apiClient: TrelloApiClient;
};

export const test = base.extend<MyTestFixtures, MyWorkerFixtures>({

  // ---------- WORKER-SCOPED: real login happens once per worker ----------
  authenticatedContext: [async ({ browser }, use, workerInfo) => {
    const context = await browser.newContext();
    const loginPage = new LoginPage(await context.newPage());

    console.log(`[Worker ${workerInfo.workerIndex}] Logging in...`);
    await loginPage.goto();
    await loginPage.login(process.env.TRELLO_EMAIL!, process.env.TRELLO_PASSWORD!);
    await loginPage.skipTwoStepVerification();
    await loginPage.page.waitForURL('**/boards');
    await loginPage.page.close(); 

    await use(context);
    await context.close();
  }, { scope: 'worker' }],

  // ---------- TEST-SCOPED: override built-in `page`, pull from the authenticated context ----------
  page: async ({ authenticatedContext }, use) => {
    const page = await authenticatedContext.newPage();
    await use(page);
    await page.close();
  },

  // ---------- Page Object fixtures — each spec just asks for what it needs ----------
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  workspacePage: async ({ page }, use) => {
    await use(new WorkspacePage(page));
  },

  boardPage: async ({ page }, use) => {
    await use(new BoardPage(page));
  },

  cardModal: async ({ page }, use) => {
    await use(new CardModal(page));
  },

  // ---------- API client fixture — no auth/session dependency, works independently ----------
  apiClient: async ({}, use) => {
    const client = new TrelloApiClient();
    await client.init();
    await use(client);
  },
});

// ---------- SEPARATE fixture set for login-flow specs — uses Playwright's default,
// unauthenticated `page` (no worker login applied), so tests can hit the real login form ----------
type LoginTestFixtures = {
  loginPage: LoginPage;
  boardPage: BoardPage;
  logoutPage:LogOutPage;
};

export const loginTest = base.extend<LoginTestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  boardPage: async ({ page }, use) => {
    await use(new BoardPage(page));
  },
   logoutPage: async ({ page }, use) => {
    await use(new LogOutPage(page));
  },
});

export { expect };