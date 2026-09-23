import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for the Grant Tranche endpoints (TrancheController).
 */
export const trancheApi = {
  /** GET /api/v1/grants/{grantId}/tranches → TrancheResponse[]. */
  listByGrant: (grantId) => http.get(`/v1/grants/${grantId}/tranches`),

  /** GET /api/v1/tranches → TrancheResponse[], every tranche across every grant. */
  listAll: () => http.get('/v1/tranches'),

  /** GET /api/v1/tranches/{id} → TrancheResponse. */
  getById: (trancheId) => http.get(`/v1/tranches/${trancheId}`),

  /** POST /api/v1/grants/{grantId}/tranches — CreateTrancheRequest → TrancheResponse (201). */
  schedule: (grantId, payload) => http.post(`/v1/grants/${grantId}/tranches`, payload),

  /** PATCH /api/v1/tranches/{id}/receive — ReceiveTrancheRequest → TrancheResponse. */
  receive: (trancheId, payload) => http.patch(`/v1/tranches/${trancheId}/receive`, payload),
};
