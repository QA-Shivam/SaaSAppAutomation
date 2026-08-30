import { test, expect } from '../../fixtures/test-fixtures';

test.describe('verify complete board creation workflow with list, card, and comment @board', () => {
    test(' create board, list, card, and comment @sanity', async ({ page, loginPage, boardPage, cardModal, apiClient, }) => {
        let boardId: string;
        let bordname:string=`Smoke Board ${Date.now()}`;
        let listname="My To Do";
        let cardname="My Card";
        let comment="Task In Progress"
        await test.step('Create a board', async () => {
            const res = await apiClient.createBoard(bordname);
            const body = await res.json();
            boardId = body.id;
            await boardPage.goto(boardId);
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
            await boardPage.openCard(cardname);
            await cardModal.addComment(comment);
            await cardModal.expectCommentVisible(comment);
        });
    });

});