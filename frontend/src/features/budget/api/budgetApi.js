import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/budgets (BudgetController).
 * One function per backend endpoint — nothing more, nothing invented.
 */
export const budgetApi = {
  /** GET /api/v1/budgets[?financialYear=&status=&budgetType=&search=] → BudgetResponse[] (no lines/history). */
  list: (params) => http.get('/v1/budgets', { params }),

  /** GET /api/v1/budgets/{id} → BudgetResponse with lines and history. */
  getById: (id) => http.get(`/v1/budgets/${id}`),

  /** POST /api/v1/budgets — body: SaveBudgetRequest → BudgetResponse (201). */
  create: (payload) => http.post('/v1/budgets', payload),

  /** PUT /api/v1/budgets/{id} — body: SaveBudgetRequest → BudgetResponse. */
  update: (id, payload) => http.put(`/v1/budgets/${id}`, payload),

  /** PATCH /api/v1/budgets/{id}/{submit|withdraw|approve|reject} — body: { note, actor } → BudgetResponse. */
  transition: (id, action, payload) => http.patch(`/v1/budgets/${id}/${action}`, payload),

  /** DELETE /api/v1/budgets/{id} → 204 (drafts only). */
  remove: (id) => http.delete(`/v1/budgets/${id}`),

  /** GET /api/v1/budgets/category-usage → { [categoryId]: lineCount }. */
  categoryUsage: () => http.get('/v1/budgets/category-usage'),
};
