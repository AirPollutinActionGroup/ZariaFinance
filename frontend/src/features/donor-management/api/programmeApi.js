import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/programmes (ProgrammeController).
 * One function per backend endpoint — nothing more, nothing invented.
 */
export const programmeApi = {
  /** GET /api/v1/programmes → ProgrammeListResponse[]. */
  list: () => http.get('/v1/programmes'),

  /** GET /api/v1/programmes/{id} → ProgrammeResponse. */
  getById: (id) => http.get(`/v1/programmes/${id}`),

  /** POST /api/v1/programmes — body: CreateProgrammeRequest → ProgrammeResponse (201). */
  create: (payload) => http.post('/v1/programmes', payload),

  /** PATCH /api/v1/programmes/{id}/activate → 204. */
  activate: (id) => http.patch(`/v1/programmes/${id}/activate`),

  /** PATCH /api/v1/programmes/{id}/deactivate → 204. */
  deactivate: (id) => http.patch(`/v1/programmes/${id}/deactivate`),
};
