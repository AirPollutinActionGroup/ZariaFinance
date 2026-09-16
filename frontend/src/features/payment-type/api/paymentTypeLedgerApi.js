import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/payment-type-ledgers (PaymentTypeLedgerController).
 * One function per backend endpoint — nothing more, nothing invented.
 */
export const paymentTypeLedgerApi = {
  /** POST /api/v1/payment-type-ledgers — body: CreatePaymentTypeLedgerRequest → PaymentTypeLedgerResponse (201). */
  create: (payload) => http.post('/v1/payment-type-ledgers', payload),

  /** GET /api/v1/payment-type-ledgers/{id} → PaymentTypeLedgerResponse. */
  getById: (id) => http.get(`/v1/payment-type-ledgers/${id}`),

  /** GET /api/v1/payment-type-ledgers[?search=] → PaymentTypeLedgerResponse[]. */
  list: (search) => http.get('/v1/payment-type-ledgers', { params: search ? { search } : undefined }),

  /** PUT /api/v1/payment-type-ledgers/{id} — body: UpdatePaymentTypeLedgerRequest → PaymentTypeLedgerResponse. */
  update: (id, payload) => http.put(`/v1/payment-type-ledgers/${id}`, payload),

  /** PATCH /api/v1/payment-type-ledgers/{id}/activate → 204. */
  activate: (id) => http.patch(`/v1/payment-type-ledgers/${id}/activate`),

  /** PATCH /api/v1/payment-type-ledgers/{id}/deactivate → 204. */
  deactivate: (id) => http.patch(`/v1/payment-type-ledgers/${id}/deactivate`),
};
