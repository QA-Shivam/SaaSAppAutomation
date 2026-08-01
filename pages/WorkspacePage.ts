import { Page, Locator, expect } from '@playwright/test';

export class WorkspacePage {
  readonly page: Page;

  readonly createWorkspaceButton: Locator;
  readonly workspaceNameInput: Locator;
  readonly workspaceTypeDropdown: Locator;
  readonly continueButton: Locator;
  readonly workspaceSwitcher: Locator;
  readonly inviteMemberInput: Locator;
  readonly sendInviteButton: Locator;
  readonly workspaceSettingsLink: Locator;
  readonly renameWorkspaceInput: Locator;
  readonly memberList: Locator;

  constructor(page: Page) {
    this.page = page;

    this.createWorkspaceButton = page.getByRole('button', { name: 'Create Workspace' });
    this.workspaceNameInput = page.getByLabel('Workspace name');
    this.workspaceTypeDropdown = page.getByLabel('Workspace type');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.workspaceSwitcher = page.getByTestId('workspace-switcher');
    this.inviteMemberInput = page.getByPlaceholder('Email address or name');
    this.sendInviteButton = page.getByRole('button', { name: 'Send Invitation' });
    this.workspaceSettingsLink = page.getByRole('link', { name: 'Settings' });
    this.renameWorkspaceInput = page.getByLabel('Workspace name');
    this.memberList = page.getByTestId('member-list-item');
  }

  async goto() {
    await this.page.goto('/');
  }

  async createWorkspace(name: string, type: string = 'Other') {
    await this.createWorkspaceButton.click();
    await this.workspaceNameInput.fill(name);
    await this.workspaceTypeDropdown.selectOption(type);
    await this.continueButton.click();
    await this.page.waitForURL('**/w/**');
  }

  async switchWorkspace(name: string) {
    await this.workspaceSwitcher.click();
    await this.page.getByText(name, { exact: true }).click();
  }

  async renameWorkspace(newName: string) {
    await this.workspaceSettingsLink.click();
    await this.renameWorkspaceInput.fill(newName);
    await this.page.keyboard.press('Enter');
  }

  async inviteMember(emailOrName: string) {
    await this.inviteMemberInput.fill(emailOrName);
    await this.sendInviteButton.click();
  }

  async expectMemberInList(name: string) {
    await expect(this.memberList.filter({ hasText: name })).toBeVisible();
  }

  async getWorkspaceCount(): Promise<number> {
    await this.workspaceSwitcher.click();
    const count = await this.page.getByTestId('workspace-list-item').count();
    await this.page.keyboard.press('Escape'); // close dropdown
    return count;
  }
}