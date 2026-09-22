import { Page, Locator, TestInfo, expect } from '@playwright/test';

export class CardModal {
  readonly page: Page;

  readonly modal: Locator;
  readonly titleInput: Locator;
  readonly descriptionField: Locator;
  readonly saveDescriptionButton: Locator;
  readonly commentInput: Locator;
  readonly saveCommentButton: Locator;
  readonly addLabelButton: Locator;
  readonly addMemberButton: Locator;
  readonly addChecklistButton: Locator;
  readonly checklistItemInput: Locator;
  readonly checklistProgress: Locator;
  readonly dueDateButton: Locator;
  readonly dateInput: Locator;
  readonly saveDueDateButton: Locator;
  readonly archiveButton: Locator;
  readonly closeModalButton: Locator;
  readonly attachmentButton: Locator;
  readonly writeCommentButton: Locator

  constructor(page: Page) {
    this.page = page;

    this.modal = page.getByRole('dialog');
    this.titleInput = this.modal.getByTestId('card-title-input');
    this.descriptionField = this.modal.getByPlaceholder('Add a more detailed description');
    this.saveDescriptionButton = this.modal.getByRole('button', { name: 'Save' });
    this.writeCommentButton = this.modal.getByRole('button', { name: "Write a comment…" });
    this.commentInput = this.modal.getByRole('textbox', { name: 'Write a comment…' });
    this.saveCommentButton = this.modal.getByRole('button', { name: 'Save', exact: true });
    this.addLabelButton = this.modal.getByRole('button', { name: 'Labels' });
    this.addMemberButton = this.modal.getByRole('button', { name: 'Members' });
    this.addChecklistButton = this.modal.getByRole('button', { name: 'Checklist' });
    this.checklistItemInput = this.modal.getByPlaceholder('Add an item');
    this.checklistProgress = this.modal.getByTestId('checklist-progress');
    this.dueDateButton = this.modal.getByRole('button', { name: 'Dates' });
    this.dateInput = this.page.getByLabel('Due date');
    this.saveDueDateButton = this.page.getByRole('button', { name: 'Save' });
    this.archiveButton = this.modal.getByRole('button', { name: 'Archive' });
    this.closeModalButton = this.modal.getByRole('button', { name: 'Close dialog' });
    this.attachmentButton = this.modal.getByRole('button', { name: 'Attachment' });
  }

  async renameCard(newTitle: string) {
    await this.titleInput.fill(newTitle);
    await this.page.keyboard.press('Enter');
  }

  async addDescription(text: string) {
    await this.descriptionField.click();
    await this.descriptionField.fill(text);
    await this.saveDescriptionButton.click();
  }

  async addComment(text: string) {
    await this.writeCommentButton.click();
    await this.commentInput.fill(text);
    await this.saveCommentButton.click();
  }

  async expectCommentVisible(text: string) {
    await expect(this.modal.getByRole('paragraph', { exact: true })).toBeVisible();
  }

  async addLabel(labelName: string) {
    await this.addLabelButton.click();
    await this.page.getByRole('checkbox', { name: labelName }).click();
    await this.page.keyboard.press('Escape');
  }

  async addMember(memberName: string) {
    await this.addMemberButton.click();
    await this.page.getByText(memberName, { exact: true }).click();
    await this.page.keyboard.press('Escape');
  }

  async addChecklist(title: string, items: string[]) {
    await this.addChecklistButton.click();
    await this.page.getByLabel('Checklist title').fill(title);
    await this.page.getByRole('button', { name: 'Add', exact: true }).click();

    for (const item of items) {
      await this.checklistItemInput.fill(item);
      await this.page.keyboard.press('Enter');
    }
    await this.page.keyboard.press('Escape');
  }

  async checkChecklistItem(itemText: string) {
    await this.modal.getByRole('checkbox', { name: itemText }).check();
  }

  async expectChecklistProgress(expectedText: string) {
    await expect(this.checklistProgress).toHaveText(expectedText);
  }

  async setDueDate(date: string) {
    // date format: 'MM/DD/YYYY' — adjust to match Trello's actual date picker input
    await this.dueDateButton.click();
    await this.dateInput.fill(date);
    await this.saveDueDateButton.click();
  }

  async archiveCard() {
    await this.archiveButton.click();
  }

  async close() {
    await this.closeModalButton.click();
    await expect(this.modal).not.toBeVisible();
  }
}