import { Page, Locator, expect } from '@playwright/test';
import { tr } from 'framer-motion/client';

export class BoardPage {
  readonly page: Page;

  readonly boardTitleInput: Locator;
  readonly addListInput: Locator;
  readonly addListButton: Locator;
  readonly visibilityDropdown: Locator;
  readonly starIcon: Locator;
  readonly boardMenuButton: Locator;
  readonly closeBoardOption: Locator;
  readonly searchCardsInput: Locator;
  readonly filterButton: Locator;
  readonly accountsTab: Locator;
  readonly accountMenuLogout: Locator;
  readonly addAnotherListButton: Locator;
  readonly addcardButton: Locator;


  constructor(page: Page) {
    this.page = page;

    this.boardTitleInput = page.locator('[aria-label="Board name"]');
    this.addListInput = page.getByPlaceholder('Enter list name…');
    this.addListButton = page.getByRole('button', { name: 'Add list' });
    this.visibilityDropdown = page.getByRole('button', { name: /Visibility/i });
    this.starIcon = page.getByTestId('board-star-icon');
    this.boardMenuButton = page.getByRole('button', { name: 'Show menu' });
    this.closeBoardOption = page.getByRole('button', { name: 'Close Board' });
    this.searchCardsInput = page.getByPlaceholder('Search cards');
    this.filterButton = page.getByRole('button', { name: 'Filter' });
    this.accountsTab = page.locator("[aria-owns*='account-menu']");
    this.accountMenuLogout = page.locator("button[data-testid*='account-menu-logout']");
    this.addAnotherListButton = page.getByRole('button', { name: "Add another list" });
    this.addcardButton = page.getByRole('button', { name: 'Add card' });

  }

  async goto(boardId: string) {
    await this.page.goto(`/b/${boardId}`);
    await this.boardTitleInput.waitFor({ state: 'visible' });
  }

  async renameBoard(newName: string) {
    await this.boardTitleInput.fill(newName);
    await this.page.keyboard.press('Enter');
  }

  async addList(name: string) {
    await this.addAnotherListButton.click();
    await this.addListInput.fill(name);
    await Promise.all([
    this.page.waitForResponse(
      (res) => res.url().includes('/1/lists') && res.request().method() === 'POST' && res.status() === 200
    ),
    this.addListButton.click(),
  ]);
  }

  list(name: string): Locator {
    return this.page.locator('[data-testid="list"]').filter({ hasText: name });
  }

  async addCard(listName: string, cardName: string) {
    const list = this.list(listName);
    const addCardButton = list.getByRole('button', { name: 'Add a card' });
    const cardTitleBox =  list.getByTestId('list-card-composer-textarea');
    await addCardButton.waitFor({ state: 'visible' });
    await addCardButton.click();
    await cardTitleBox.waitFor({ state: 'visible' });
    await cardTitleBox.fill(cardName);
    const addCardBtn = list.getByTestId('list-card-composer-add-card-button');
    await addCardBtn.click();
  }

  card(cardName: string): Locator {
    return this.page.getByRole('link', { name: cardName, exact: true, });
  }

  async openCard(cardName: string) {
    await this.card(cardName).click();
  }

  async moveCard(cardName: string, targetListName: string) {
    const card = this.card(cardName);
    const targetList = this.list(targetListName);
    await card.dragTo(targetList);
  }

  async archiveList(listName: string) {
    const list = this.list(listName);
    await list.getByRole('button', { name: 'List actions' }).click();
    await this.page.getByRole('button', { name: 'Archive this list' }).click();
  }

  async setVisibility(option: 'Private' | 'Workspace' | 'Public') {
    await this.visibilityDropdown.click();
    await this.page.getByRole('menuitem', { name: option }).click();
  }

  async closeBoard() {
    await this.boardMenuButton.click();
    await this.closeBoardOption.click();
  }

  async searchCards(query: string) {
    await this.searchCardsInput.fill(query);
  }

  async expectCardVisible(cardName: string) {
    await expect(this.card(cardName)).toBeVisible();
  }

  async expectCardNotVisible(cardName: string) {
    await expect(this.card(cardName)).not.toBeVisible();
  }

  async expectListCount(count: number) {
    await expect(this.page.locator('[data-testid="list"]')).toHaveCount(count);
  }

  async gotoAccounts() {
    await this.accountsTab.click();
  }

  async logout() {
    await this.accountMenuLogout.click();
  }
}