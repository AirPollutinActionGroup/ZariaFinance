import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/budget-categories (BudgetCategoryController).
 * One function per backend endpoint — nothing more, nothing invented.
 */
export const budgetCategoryApi = {
  /** POST /api/v1/budget-categories — body: CreateBudgetCategoryRequest → BudgetCategoryResponse (201). */
  create: (payload) => http.post('/v1/budget-categories', payload),

  /** GET /api/v1/budget-categories/{id} → BudgetCategoryResponse. */
  getById: (id) => http.get(`/v1/budget-categories/${id}`),

  /** GET /api/v1/budget-categories[?search=] → BudgetCategoryResponse[]. */
  list: (search) => http.get('/v1/budget-categories', { params: search ? { search } : undefined }),

  /** PUT /api/v1/budget-categories/{id} — body: UpdateBudgetCategoryRequest → BudgetCategoryResponse. */
  update: (id, payload) => http.put(`/v1/budget-categories/${id}`, payload),

  /** PATCH /api/v1/budget-categories/{id}/activate → 204. */
  activate: (id) => http.patch(`/v1/budget-categories/${id}/activate`),

  /** PATCH /api/v1/budget-categories/{id}/deactivate → 204. */
  deactivate: (id) => http.patch(`/v1/budget-categories/${id}/deactivate`),
};
