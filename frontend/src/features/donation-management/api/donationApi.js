import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/donations (DonationController).
 * One function per backend endpoint — nothing more, nothing invented.
 */
export const donationApi = {
  /** POST /api/v1/donations — body: CreateDonationRequest → DonationDetailResponse (201). */
  create: (payload) => http.post('/v1/donations', payload),

  /** GET /api/v1/donations/{id} → DonationDetailResponse. */
  getById: (id) => http.get(`/v1/donations/${id}`),

  /** PUT /api/v1/donations/{id} — body: CreateDonationRequest → DonationDetailResponse. */
  update: (id, payload) => http.put(`/v1/donations/${id}`, payload),

  /**
   * GET /api/v1/donations[?donorId=|complianceState=|search=] → DonationListResponse[].
   * The backend applies exactly one filter, in that priority order.
   */
  list: ({ donorId, complianceState, search } = {}) => {
    const params = {};
    if (donorId != null) params.donorId = donorId;
    else if (complianceState) params.complianceState = complianceState;
    else if (search) params.search = search;
    return http.get('/v1/donations', { params });
  },

  /**
   * PATCH /api/v1/donations/{donationId}/gik-items/{gikItemId}/intended-use
   * body: { intendedUse, reason } → DonationDetailResponse.
   */
  updateGikIntendedUse: (donationId, gikItemId, payload) =>
    http.patch(`/v1/donations/${donationId}/gik-items/${gikItemId}/intended-use`, payload),

  /** PATCH /api/v1/donations/{id}/issue-80g-receipt → DonationDetailResponse. */
  issueEightyGReceipt: (id) => http.patch(`/v1/donations/${id}/issue-80g-receipt`),

  /** PATCH /api/v1/donations/{id}/10bd-filing → DonationDetailResponse. */
  markTenBdFiling: (id) => http.patch(`/v1/donations/${id}/10bd-filing`),
};
