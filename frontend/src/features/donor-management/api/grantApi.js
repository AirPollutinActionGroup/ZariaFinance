import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/grants (GrantController).
 *
 * Note: the backend's PUT /api/v1/grants/{id} is currently a stub that
 * returns 204 without persisting (see GrantController.updateGrant). The
 * frontend therefore does not offer grant editing — docs/BACKEND_GAPS.md #5.
 */
export const grantApi = {
  /** POST /api/v1/grants — body: CreateGrantRequest → GrantDetailsResponse (201). */
  create: (payload) => http.post('/v1/grants', payload),

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

  /** PATCH /api/v1/grants/{id}/approve → 204. */
  approve: (id) => http.patch(`/v1/grants/${id}/approve`),

  /** PATCH /api/v1/grants/{id}/activate → 204. */
  activate: (id) => http.patch(`/v1/grants/${id}/activate`),

  /** PATCH /api/v1/grants/{id}/close → 204. */
  close: (id) => http.patch(`/v1/grants/${id}/close`),
};
