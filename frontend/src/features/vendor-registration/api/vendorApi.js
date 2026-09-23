import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/vendors (VendorRegisterController).
 * One function per backend endpoint — nothing more, nothing invented.
 */
export const vendorApi = {
  /** POST /api/v1/vendors — body: CreateVendorRequest → VendorResponse (201). */
  create: (payload) => http.post('/v1/vendors', payload),

  /** GET /api/v1/vendors/{id} → VendorResponse. */
  getById: (id) => http.get(`/v1/vendors/${id}`),

  /** GET /api/v1/vendors[?search=] → VendorResponse[]. */
  list: (search) => http.get('/v1/vendors', { params: search ? { search } : undefined }),

  /** PATCH /api/v1/vendors/{id}/activate → 204. */
  activate: (id) => http.patch(`/v1/vendors/${id}/activate`),

  /** PATCH /api/v1/vendors/{id}/deactivate → 204. */
  deactivate: (id) => http.patch(`/v1/vendors/${id}/deactivate`),
};
