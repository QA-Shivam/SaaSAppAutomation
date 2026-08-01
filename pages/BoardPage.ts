import { Page, Locator, expect } from '@playwright/test';

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

  constructor(page: Page) {
    this.page = page;

    this.boardTitleInput = page.getByTestId('board-name-input');
    this.addListInput = page.getByPlaceholder('Enter list name');
    this.addListButton = page.getByRole('button', { name: 'Add another list' });
    this.visibilityDropdown = page.getByRole('button', { name: /Visibility/i });
    this.starIcon = page.getByTestId('board-star-icon');
    this.boardMenuButton = page.getByRole('button', { name: 'Show menu' });
    this.closeBoardOption = page.getByRole('button', { name: 'Close Board' });
    this.searchCardsInput = page.getByPlaceholder('Search cards');
    this.filterButton = page.getByRole('button', { name: 'Filter' });
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
    await this.addListInput.fill(name);
    await this.page.keyboard.press('Enter');
    await this.page.keyboard.press('Escape'); // close the input after adding
  }

  list(name: string): Locator {
    return this.page.locator('[data-testid="list"]', { hasText: name });
  }

  async addCard(listName: string, cardName: string) {
    const list = this.list(listName);
    await list.getByText('Add a card').click();
    await list.getByPlaceholder('Enter a title for this card').fill(cardName);
    await this.page.keyboard.press('Enter');
    await this.page.keyboard.press('Escape');
  }

  card(cardName: string): Locator {
    return this.page.getByText(cardName, { exact: true });
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
}