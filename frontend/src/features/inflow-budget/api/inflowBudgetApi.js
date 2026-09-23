import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/inflow-budget (InflowBudgetController).
 * One function per backend endpoint — nothing more, nothing invented.
 */
export const inflowBudgetApi = {
  /** GET /api/v1/inflow-budget → InflowBudgetLineResponse[]. */
  list: () => http.get('/v1/inflow-budget'),

  /** GET /api/v1/inflow-budget/{id} → InflowBudgetLineResponse. */
  getById: (id) => http.get(`/v1/inflow-budget/${id}`),

  /** POST /api/v1/inflow-budget/{id}/receipt — body: RecordInflowReceiptRequest → InflowBudgetLineResponse. */
  recordReceipt: (id, payload) => http.post(`/v1/inflow-budget/${id}/receipt`, payload),
};
