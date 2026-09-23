import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/financial-years (FinancialYearController).
 * One function per backend endpoint — nothing more, nothing invented.
 */
export const financialYearApi = {
  /** POST /api/v1/financial-years — body: CreateFinancialYearRequest → FinancialYearResponse (201). */
  create: (payload) => http.post('/v1/financial-years', payload),

  /** GET /api/v1/financial-years/{id} → FinancialYearResponse. */
  getById: (id) => http.get(`/v1/financial-years/${id}`),

  /** GET /api/v1/financial-years → FinancialYearResponse[]. */
  list: () => http.get('/v1/financial-years'),

  /** PUT /api/v1/financial-years/{id} — body: UpdateFinancialYearRequest → FinancialYearResponse. */
  update: (id, payload) => http.put(`/v1/financial-years/${id}`, payload),

  /** PATCH /api/v1/financial-years/{id}/set-current → 204. */
  setCurrent: (id) => http.patch(`/v1/financial-years/${id}/set-current`),
};
