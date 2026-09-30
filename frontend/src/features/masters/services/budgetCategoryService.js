import { budgetCategoryApi } from '../api/budgetCategoryApi.js';
import {
  fromBudgetCategoryResponse,
  toCreateBudgetCategoryRequest,
  toUpdateBudgetCategoryRequest,
} from '../mappers/budgetCategoryMapper.js';

/**
 * Budget Category domain service. All business behaviour lives here; hooks
 * and components call the service, never the repository directly.
 */
export const budgetCategoryService = {
  async listBudgetCategories(search) {
    const dtos = await budgetCategoryApi.list(search);
    return dtos.map(fromBudgetCategoryResponse);
  },

  async createBudgetCategory(formValues) {
    return fromBudgetCategoryResponse(await budgetCategoryApi.create(toCreateBudgetCategoryRequest(formValues)));
  },

  async updateBudgetCategory(id, formValues) {
    return fromBudgetCategoryResponse(await budgetCategoryApi.update(id, toUpdateBudgetCategoryRequest(formValues)));
  },

  async activateBudgetCategory(id) {
    await budgetCategoryApi.activate(id);
  },

  async deactivateBudgetCategory(id) {
    await budgetCategoryApi.deactivate(id);
  },
};
