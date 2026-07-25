import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/grants (GrantController).
 */
export const grantApi = {
  /** POST /api/v1/grants — body: CreateGrantRequest → GrantDetailsResponse (201). */
  create: (payload) => http.post('/v1/grants', payload),

  /** PUT /api/v1/grants/{id} — body: CreateGrantRequest → GrantDetailsResponse. */
  update: (id, payload) => http.put(`/v1/grants/${id}`, payload),

  /** GET /api/v1/grants/{id} → GrantDetailsResponse. */
  getById: (id) => http.get(`/v1/grants/${id}`),

  /**
   * GET /api/v1/grants[?donorId=|programmeId=|search=] → GrantListResponse[].
   * The backend applies exactly one filter, in that priority order.
   */
  list: ({ donorId, programmeId, search } = {}) => {
    const params = {};
    if (donorId != null) params.donorId = donorId;
    else if (programmeId != null) params.programmeId = programmeId;
    else if (search) params.search = search;
    return http.get('/v1/grants', { params });
  },

  /** PATCH /api/v1/grants/{id}/approve — body: ApproveGrantRequest → 204. */
  approve: (id, payload) => http.patch(`/v1/grants/${id}/approve`, payload),

  /** PATCH /api/v1/grants/{id}/activate → 204. */
  activate: (id) => http.patch(`/v1/grants/${id}/activate`),

  /** PATCH /api/v1/grants/{id}/close → 204. */
  close: (id) => http.patch(`/v1/grants/${id}/close`),

  /** PATCH /api/v1/grants/{id}/hold — body: {remarks} → 204. */
  hold: (id, payload) => http.patch(`/v1/grants/${id}/hold`, payload),

  /** PATCH /api/v1/grants/{id}/resume → 204. */
  resume: (id) => http.patch(`/v1/grants/${id}/resume`),

  /** PATCH /api/v1/grants/{id}/complete → 204. */
  complete: (id) => http.patch(`/v1/grants/${id}/complete`),
};
