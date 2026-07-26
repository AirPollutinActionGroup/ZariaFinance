import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/grants/{id}/disbursement (DisbursementController).
 */
export const disbursementApi = {
  /** GET → DisbursementScheduleResponse; an unconfigured grant returns an empty shell. */
  getByGrant: (grantId) => http.get(`/v1/grants/${grantId}/disbursement`),

  /** PUT — replaces the whole configuration in one payload. */
  save: (grantId, payload) => http.put(`/v1/grants/${grantId}/disbursement`, payload),

  /** POST /finalise — requires Σ tranches to equal the total grant amount. */
  finalise: (grantId) => http.post(`/v1/grants/${grantId}/disbursement/finalise`),

  /** POST /prefill — seeds tranches from the grant's fund profile plan. */
  prefill: (grantId) => http.post(`/v1/grants/${grantId}/disbursement/prefill`),

  /** PATCH /disbursement/criteria/{id}/met — records a satisfied release condition. */
  markCriterionMet: (criterionId, userId) =>
    http.patch(`/v1/disbursement/criteria/${criterionId}/met`, null, {
      params: userId ? { userId } : {},
    }),
};
