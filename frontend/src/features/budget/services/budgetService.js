import { budgetApi } from '../api/budgetApi.js';
import { fromBudgetResponse, toSaveBudgetRequest } from '../mappers/budgetMapper.js';

/**
 * Budget domain service. All business behaviour lives here; hooks and
 * components call the service, never the repository directly.
 */
export const budgetService = {
  async listBudgets(params) {
    const dtos = await budgetApi.list(params);
    return dtos.map(fromBudgetResponse);
  },

  async getBudget(id) {
    return fromBudgetResponse(await budgetApi.getById(id));
  },

  async createBudget(draft, meta) {
    return fromBudgetResponse(await budgetApi.create(toSaveBudgetRequest(draft, meta)));
  },

  async updateBudget(id, draft, meta) {
    return fromBudgetResponse(await budgetApi.update(id, toSaveBudgetRequest(draft, meta)));
  },

  /** action: submit | withdraw | approve | reject */
  async transitionBudget(id, action, { note, actor } = {}) {
    return fromBudgetResponse(await budgetApi.transition(id, action, { note: note || null, actor: actor || null }));
  },

  async deleteBudget(id) {
    await budgetApi.remove(id);
  },

  /** { [categoryId]: number of budget lines } */
  async getCategoryUsage() {
    return budgetApi.categoryUsage();
  },
};
