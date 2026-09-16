import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/payment-type-groups (PaymentTypeGroupController).
 * One function per backend endpoint — nothing more, nothing invented.
 */
export const paymentTypeGroupApi = {
  /** POST /api/v1/payment-type-groups — body: CreatePaymentTypeGroupRequest → PaymentTypeGroupResponse (201). */
  create: (payload) => http.post('/v1/payment-type-groups', payload),

  /** GET /api/v1/payment-type-groups/{id} → PaymentTypeGroupResponse. */
  getById: (id) => http.get(`/v1/payment-type-groups/${id}`),

  /** GET /api/v1/payment-type-groups[?search=] → PaymentTypeGroupResponse[]. */
  list: (search) => http.get('/v1/payment-type-groups', { params: search ? { search } : undefined }),

  /** PUT /api/v1/payment-type-groups/{id} — body: UpdatePaymentTypeGroupRequest → PaymentTypeGroupResponse. */
  update: (id, payload) => http.put(`/v1/payment-type-groups/${id}`, payload),

  /** PATCH /api/v1/payment-type-groups/{id}/activate → 204. */
  activate: (id) => http.patch(`/v1/payment-type-groups/${id}/activate`),

  /** PATCH /api/v1/payment-type-groups/{id}/deactivate → 204. */
  deactivate: (id) => http.patch(`/v1/payment-type-groups/${id}/deactivate`),
};
