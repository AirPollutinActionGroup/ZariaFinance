import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/donors (DonorController).
 * One function per backend endpoint — nothing more, nothing invented.
 */
export const donorApi = {
  /** POST /api/v1/donors — body: CreateDonorRequest → DonorResponse (201). */
  create: (payload) => http.post('/v1/donors', payload),

  /** GET /api/v1/donors/{id} → DonorResponse. */
  getById: (id) => http.get(`/v1/donors/${id}`),

  /** GET /api/v1/donors[?search=] → DonorResponse[]. */
  list: (search) =>
    http.get('/v1/donors', { params: search ? { search } : undefined }),

  /** PUT /api/v1/donors/{id} — body: UpdateDonorRequest → DonorResponse. */
  update: (id, payload) => http.put(`/v1/donors/${id}`, payload),

  /** PATCH /api/v1/donors/{id}/activate → 204. */
  activate: (id) => http.patch(`/v1/donors/${id}/activate`),

  /** PATCH /api/v1/donors/{id}/deactivate → 204. */
  deactivate: (id) => http.patch(`/v1/donors/${id}/deactivate`),
};
