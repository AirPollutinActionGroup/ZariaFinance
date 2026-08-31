import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/payment-modes (PaymentModeController).
 * One function per backend endpoint — nothing more, nothing invented.
 */
export const paymentModeApi = {
  /** POST /api/v1/payment-modes — body: CreatePaymentModeRequest → PaymentModeResponse (201). */
  create: (payload) => http.post('/v1/payment-modes', payload),

  /** GET /api/v1/payment-modes/{id} → PaymentModeResponse. */
  getById: (id) => http.get(`/v1/payment-modes/${id}`),

  /** GET /api/v1/payment-modes[?search=] → PaymentModeResponse[]. */
  list: (search) => http.get('/v1/payment-modes', { params: search ? { search } : undefined }),

  /** PUT /api/v1/payment-modes/{id} — body: UpdatePaymentModeRequest → PaymentModeResponse. */
  update: (id, payload) => http.put(`/v1/payment-modes/${id}`, payload),

  /** PATCH /api/v1/payment-modes/{id}/activate → 204. */
  activate: (id) => http.patch(`/v1/payment-modes/${id}/activate`),

  /** PATCH /api/v1/payment-modes/{id}/deactivate → 204. */
  deactivate: (id) => http.patch(`/v1/payment-modes/${id}/deactivate`),
};
