import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for the Fund Profile endpoints (FundProfileController).
 * One function per backend endpoint — nothing invented.
 */
export const fundProfileApi = {
  /** GET /api/v1/donors/{donorId}/fund-profiles → FundProfileResponse[]. */
  listByDonor: (donorId) => http.get(`/v1/donors/${donorId}/fund-profiles`),

  /** POST /api/v1/donors/{donorId}/fund-profiles — CreateFundProfileRequest → FundProfileResponse (201). */
  create: (donorId, payload) => http.post(`/v1/donors/${donorId}/fund-profiles`, payload),

  /** GET /api/v1/fund-profiles/{id} → FundProfileResponse. */
  getById: (id) => http.get(`/v1/fund-profiles/${id}`),

  /** PUT /api/v1/fund-profiles/{id} — CreateFundProfileRequest → FundProfileResponse. */
  update: (id, payload) => http.put(`/v1/fund-profiles/${id}`, payload),
};
