import { http } from '../../../lib/api/apiClient.js';

/** Repository for /api/v1/debit-notes/fund-suggestions (FundSuggestionController). */
export const fundSuggestionApi = {
  /**
   * GET /api/v1/debit-notes/fund-suggestions?outflowLineId&amount&date&book&limit
   * → FundSuggestionResponse[] (best first).
   */
  forDebitNote: (params) => http.get('/v1/debit-notes/fund-suggestions', { params }),

  /** GET …/weights → FundSuggestionWeightsResponse { weights, defaults, changeReason, updatedBy, updatedAt }. */
  getWeights: () => http.get('/v1/debit-notes/fund-suggestions/weights'),

  /** PUT …/weights — body: UpdateFundSuggestionWeightsRequest → FundSuggestionWeightsResponse. */
  updateWeights: (payload) => http.put('/v1/debit-notes/fund-suggestions/weights', payload),

  /** POST …/weights/reset?actor= → FundSuggestionWeightsResponse. */
  resetWeights: (actor) => http.post('/v1/debit-notes/fund-suggestions/weights/reset', null, { params: { actor } }),
};
