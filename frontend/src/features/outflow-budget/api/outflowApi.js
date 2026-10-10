import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/outflow-budget (OutflowBudgetController) — the
 * read-only outflow schedule derived from approved budgets.
 */
export const outflowApi = {
  /** GET /api/v1/outflow-budget[?financialYear=2026-27] → OutflowRowResponse[]. */
  list: (financialYear) =>
    http.get('/v1/outflow-budget', { params: financialYear ? { financialYear } : undefined }),

  /** GET /api/v1/outflow-budget/{rowId} → OutflowRowResponse. */
  getById: (rowId) => http.get(`/v1/outflow-budget/${encodeURIComponent(rowId)}`),
};
