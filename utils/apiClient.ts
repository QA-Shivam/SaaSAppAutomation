import { APIRequestContext, APIResponse, request } from '@playwright/test';

const BASE = 'https://api.trello.com/1';
const KEY = process.env.TRELLO_API_KEY!;
const TOKEN = process.env.TRELLO_API_TOKEN!;



export class TrelloApiClient {
  private ctx!: APIRequestContext;

  async init() {
    this.ctx = await request.newContext();
  }

  async dispose() {
    await this.ctx.dispose();
  }

  private authParams(extra: Record<string, string | number | boolean> = {}) {
    return { key: KEY, token: TOKEN, ...extra };
  }

  // ---------- BOARDS ----------

  async createBoard(name: string, extra: Record<string, string> = {}): Promise<APIResponse> {
    const params = this.authParams({ name, ...extra });
    console.log(`[API REQUEST] POST ${BASE}/boards/`, { ...params, token: '***hidden***' });

    const res = await this.ctx.post(`${BASE}/boards/`, { params });

    const responseBody = await res.text(); 
    console.log(`[API RESPONSE] Status: ${res.status()}`);

    if (!res.ok()) {
      throw new Error(`Trello API error (${res.status()}): ${responseBody}`);
    }
    return res;
  }

  async getBoard(id: string): Promise<APIResponse> {
    return this.ctx.get(`${BASE}/boards/${id}`, { params: this.authParams() });
  }

  async updateBoard(id: string, fields: Record<string, string>): Promise<APIResponse> {
    return this.ctx.put(`${BASE}/boards/${id}`, { params: this.authParams(fields) });
  }

  async deleteBoard(id: string): Promise<APIResponse> {
    return this.ctx.delete(`${BASE}/boards/${id}`, { params: this.authParams() });
  }

  async getBoardMembers(boardId: string): Promise<APIResponse> {
    return this.ctx.get(`${BASE}/boards/${boardId}/members`, { params: this.authParams() });
  }

  async addBoardMember(boardId: string, emailOrId: string, type: 'admin' | 'normal' | 'observer' = 'normal'): Promise<APIResponse> {
    return this.ctx.put(`${BASE}/boards/${boardId}/members/${emailOrId}`, {
      params: this.authParams({ type }),
    });
  }

  async removeBoardMember(boardId: string, memberId: string): Promise<APIResponse> {
    return this.ctx.delete(`${BASE}/boards/${boardId}/members/${memberId}`, { params: this.authParams() });
  }

  // ---------- LISTS ----------

  async createList(boardId: string, name: string): Promise<APIResponse> {
    return this.ctx.post(`${BASE}/lists`, { params: this.authParams({ name, idBoard: boardId }) });
  }

  async getListsOnBoard(boardId: string): Promise<APIResponse> {
    return this.ctx.get(`${BASE}/boards/${boardId}/lists`, { params: this.authParams() });
  }

  async updateList(listId: string, fields: Record<string, string>): Promise<APIResponse> {
    return this.ctx.put(`${BASE}/lists/${listId}`, { params: this.authParams(fields) });
  }

  async archiveList(listId: string): Promise<APIResponse> {
    return this.ctx.put(`${BASE}/lists/${listId}/closed`, { params: this.authParams({ value: 'true' }) });
  }

  // ---------- CARDS ----------

  async createCard(listId: string, name: string, extra: Record<string, string> = {}): Promise<APIResponse> {
    return this.ctx.post(`${BASE}/cards`, { params: this.authParams({ idList: listId, name, ...extra }) });
  }

  async getCard(cardId: string): Promise<APIResponse> {
    return this.ctx.get(`${BASE}/cards/${cardId}`, { params: this.authParams() });
  }

  async getCardsOnList(listId: string): Promise<APIResponse> {
    return this.ctx.get(`${BASE}/lists/${listId}/cards`, { params: this.authParams() });
  }

  async updateCard(cardId: string, fields: Record<string, string>): Promise<APIResponse> {
    // used for rename, move (idList), due date, labels (idLabels), archive (closed), etc.
    return this.ctx.put(`${BASE}/cards/${cardId}`, { params: this.authParams(fields) });
  }

  async moveCard(cardId: string, targetListId: string): Promise<APIResponse> {
    return this.updateCard(cardId, { idList: targetListId });
  }

  async archiveCard(cardId: string): Promise<APIResponse> {
    return this.updateCard(cardId, { closed: 'true' });
  }

  async deleteCard(cardId: string): Promise<APIResponse> {
    return this.ctx.delete(`${BASE}/cards/${cardId}`, { params: this.authParams() });
  }

  // ---------- COMMENTS ----------

  async addComment(cardId: string, text: string): Promise<APIResponse> {
    return this.ctx.post(`${BASE}/cards/${cardId}/actions/comments`, {
      params: this.authParams({ text }),
    });
  }

  async getComments(cardId: string): Promise<APIResponse> {
    return this.ctx.get(`${BASE}/cards/${cardId}/actions`, {
      params: this.authParams({ filter: 'commentCard' }),
    });
  }

  // ---------- CHECKLISTS ----------

  async createChecklist(cardId: string, name: string): Promise<APIResponse> {
    return this.ctx.post(`${BASE}/checklists`, { params: this.authParams({ idCard: cardId, name }) });
  }

  async addChecklistItem(checklistId: string, name: string): Promise<APIResponse> {
    return this.ctx.post(`${BASE}/checklists/${checklistId}/checkItems`, {
      params: this.authParams({ name }),
    });
  }

  async checkItem(cardId: string, checklistId: string, itemId: string): Promise<APIResponse> {
    return this.ctx.put(`${BASE}/cards/${cardId}/checkItem/${itemId}`, {
      params: this.authParams({ state: 'complete' }),
    });
  }

  // ---------- MEMBERS (user-level, not board-level) ----------

  async getMember(usernameOrId: string = 'me'): Promise<APIResponse> {
    return this.ctx.get(`${BASE}/members/${usernameOrId}`, { params: this.authParams() });
  }

  async getMemberBoards(usernameOrId: string = 'me'): Promise<APIResponse> {
    return this.ctx.get(`${BASE}/members/${usernameOrId}/boards`, { params: this.authParams() });
  }

  async deleteBoardsByName(name: string): Promise<void> {
    const response = await this.getMemberBoards();
    if (!response.ok()) {
      throw new Error(`Trello API error (${response.status()}): ${await response.text()}`);
    }

    const boards = await response.json() as Array<{ id: string; name: string }>;
    for (const board of boards.filter((item) => item.name === name)) {
      const deleteResponse = await this.deleteBoard(board.id);
      if (!deleteResponse.ok()) {
        throw new Error(`Trello API error (${deleteResponse.status()}): ${await deleteResponse.text()}`);
      }
    }
  }

  // ---------- WEBHOOKS ----------

  async createWebhook(callbackUrl: string, idModel: string, description = 'test webhook'): Promise<APIResponse> {
    return this.ctx.post(`${BASE}/webhooks`, {
      params: this.authParams({ callbackURL: callbackUrl, idModel, description }),
    });
  }

  async getWebhook(webhookId: string): Promise<APIResponse> {
    return this.ctx.get(`${BASE}/webhooks/${webhookId}`, { params: this.authParams() });
  }

  async deleteWebhook(webhookId: string): Promise<APIResponse> {
    return this.ctx.delete(`${BASE}/webhooks/${webhookId}`, { params: this.authParams() });
  }

  // ---------- NEGATIVE / AUTH TEST HELPERS ----------

  async getBoardWithoutAuth(id: string): Promise<APIResponse> {
    // deliberately omits key/token to test 401 behavior
    return this.ctx.get(`${BASE}/boards/${id}`);
  }

  async getBoardWithInvalidToken(id: string): Promise<APIResponse> {
    return this.ctx.get(`${BASE}/boards/${id}`, { params: { key: KEY, token: 'invalid-token-123' } });
  }
}