import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/bank-details (BankDetailController).
 * One function per backend endpoint — nothing more, nothing invented.
 */
export const bankDetailApi = {
  /** POST /api/v1/bank-details — body: CreateBankDetailRequest → BankDetailResponse (201). */
  create: (payload) => http.post('/v1/bank-details', payload),

  /** GET /api/v1/bank-details/{id} → BankDetailResponse. */
  getById: (id) => http.get(`/v1/bank-details/${id}`),

  /** GET /api/v1/bank-details[?search=] → BankDetailResponse[]. */
  list: (search) => http.get('/v1/bank-details', { params: search ? { search } : undefined }),

  /** PUT /api/v1/bank-details/{id} — body: UpdateBankDetailRequest → BankDetailResponse. */
  update: (id, payload) => http.put(`/v1/bank-details/${id}`, payload),

  /** PATCH /api/v1/bank-details/{id}/activate → 204. */
  activate: (id) => http.patch(`/v1/bank-details/${id}/activate`),

  /** PATCH /api/v1/bank-details/{id}/deactivate → 204. */
  deactivate: (id) => http.patch(`/v1/bank-details/${id}/deactivate`),
};
