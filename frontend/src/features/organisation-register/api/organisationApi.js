import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/organisations (OrganisationRegisterController).
 * One function per backend endpoint — nothing more, nothing invented.
 */
export const organisationApi = {
  /** POST /api/v1/organisations — body: CreateOrganisationRequest → OrganisationResponse (201). */
  create: (payload) => http.post('/v1/organisations', payload),

  /** GET /api/v1/organisations/{id} → OrganisationResponse. */
  getById: (id) => http.get(`/v1/organisations/${id}`),

  /** GET /api/v1/organisations[?search=] → OrganisationResponse[]. */
  list: (search) =>
    http.get('/v1/organisations', { params: search ? { search } : undefined }),

  /** GET /api/v1/organisations/verify-short-name?shortName= → { shortName, exists }. */
  verifyShortName: (shortName) =>
    http.get('/v1/organisations/verify-short-name', { params: { shortName } }),

  /** PUT /api/v1/organisations/{id} — body: UpdateOrganisationRequest → OrganisationResponse. */
  update: (id, payload) => http.put(`/v1/organisations/${id}`, payload),

  /** PATCH /api/v1/organisations/{id}/activate → 204. */
  activate: (id) => http.patch(`/v1/organisations/${id}/activate`),

  /** PATCH /api/v1/organisations/{id}/deactivate → 204. */
  deactivate: (id) => http.patch(`/v1/organisations/${id}/deactivate`),
};
