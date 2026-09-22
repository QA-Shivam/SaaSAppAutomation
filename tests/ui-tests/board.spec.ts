import { test, expect } from '../../fixtures/test-fixtures';

test.describe('verify complete board creation workflow with list, card, and comment @board', () => {
    const boardName = `Smoke Board ${Date.now()}`;
    let boardId: string | undefined;

    test.beforeAll(async ({ apiClient }) => {
        await apiClient.deleteBoardsByName(boardName);
        boardId = undefined;
    });

    test.afterAll(async ({ apiClient }) => {
        if (boardId) {
            const response = await apiClient.deleteBoard(boardId);
            if (!response.ok()) {
                throw new Error(`Failed to delete board ${boardId}: ${response.status()}`);
            }
        }
    });

    test(' create board, list, card, and comment @sanity', async ({ boardPage, cardModal, apiClient, }, testInfo) => {
        let listname="My To Do";
        let cardname="My Card";
        let comment="Task In Progress"
        await test.step('Create a board', async () => {
            const res = await apiClient.createBoard(boardName);
            const body = await res.json();
            boardId = body.id;
            await boardPage.goto(boardId!);
        });

        await test.step('Create a list', async () => {
            await boardPage.addList(listname);
            await expect(boardPage.list(listname)).toBeVisible();
        });

        await test.step('Add a card to the list', async () => {
            await boardPage.addCard(listname, cardname);
            await expect(boardPage.card(cardname)).toBeVisible();
        });

        await test.step('Open the card and add a comment', async () => {
            await boardPage.goto(boardId!);
            await boardPage.openCard(cardname);
            await cardModal.addComment(comment);
            await cardModal.expectCommentVisible(comment, testInfo);
        });
    });

});