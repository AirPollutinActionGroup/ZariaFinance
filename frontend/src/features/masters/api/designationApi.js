import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/designations (DesignationController).
 * One function per backend endpoint — nothing more, nothing invented.
 */
export const designationApi = {
  /** POST /api/v1/designations — body: CreateDesignationRequest → DesignationResponse (201). */
  create: (payload) => http.post('/v1/designations', payload),

  /** GET /api/v1/designations/{id} → DesignationResponse. */
  getById: (id) => http.get(`/v1/designations/${id}`),

  /** GET /api/v1/designations[?search=] → DesignationResponse[]. */
  list: (search) => http.get('/v1/designations', { params: search ? { search } : undefined }),

  /** PUT /api/v1/designations/{id} — body: UpdateDesignationRequest → DesignationResponse. */
  update: (id, payload) => http.put(`/v1/designations/${id}`, payload),

  /** PATCH /api/v1/designations/{id}/activate → 204. */
  activate: (id) => http.patch(`/v1/designations/${id}/activate`),

  /** PATCH /api/v1/designations/{id}/deactivate → 204. */
  deactivate: (id) => http.patch(`/v1/designations/${id}/deactivate`),
};
