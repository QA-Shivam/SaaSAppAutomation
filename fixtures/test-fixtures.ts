import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { WorkspacePage } from '../pages/WorkspacePage';
import { BoardPage } from '../pages/BoardPage';
import { CardModal } from '../pages/CardModal';
import { TrelloApiClient } from '../utils/apiClient';

// 1. Define the shape of our custom fixtures
type MyFixtures = {
  loginPage: LoginPage;
  workspacePage: WorkspacePage;
  boardPage: BoardPage;
  cardModal: CardModal;
  apiClient: TrelloApiClient;
};

// 2. Extend base test with our fixtures
export const test = base.extend<MyFixtures>({
  // Page Object fixtures — each spec just asks for what it needs
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  workspacePage: async ({ page }, use) => {
    const workspacePage = new WorkspacePage(page);
    await use(workspacePage);
  },

  boardPage: async ({ page }, use) => {
    const boardPage = new BoardPage(page);
    await use(boardPage);
  },

  cardModal: async ({ page }, use) => {
    const cardModal = new CardModal(page);
    await use(cardModal);
  },

  // API client fixture — initialized once per test, reused across the test body
  apiClient: async ({}, use) => {
    const client = new TrelloApiClient();
    await client.init();
    await use(client);
  },
});

export { expect };