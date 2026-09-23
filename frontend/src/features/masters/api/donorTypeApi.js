import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/donor-types (DonorTypeController).
 * One function per backend endpoint — nothing more, nothing invented.
 */
export const donorTypeApi = {
  /** POST /api/v1/donor-types — body: CreateDonorTypeRequest → DonorTypeResponse (201). */
  create: (payload) => http.post('/v1/donor-types', payload),

  /** GET /api/v1/donor-types/{id} → DonorTypeResponse. */
  getById: (id) => http.get(`/v1/donor-types/${id}`),

  /** GET /api/v1/donor-types[?search=] → DonorTypeResponse[]. */
  list: (search) => http.get('/v1/donor-types', { params: search ? { search } : undefined }),

  /** PUT /api/v1/donor-types/{id} — body: UpdateDonorTypeRequest → DonorTypeResponse. */
  update: (id, payload) => http.put(`/v1/donor-types/${id}`, payload),

  /** PATCH /api/v1/donor-types/{id}/activate → 204. */
  activate: (id) => http.patch(`/v1/donor-types/${id}/activate`),

  /** PATCH /api/v1/donor-types/{id}/deactivate → 204. */
  deactivate: (id) => http.patch(`/v1/donor-types/${id}/deactivate`),
};
