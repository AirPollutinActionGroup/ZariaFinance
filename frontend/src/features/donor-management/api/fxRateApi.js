import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/fx-rates (FxRateController).
 */
export const fxRateApi = {
  /**
   * GET /api/v1/fx-rates?currency=&date= → FxRateResponse.
   * Always 200: an unavailable rate returns rateToInr = null rather than an error.
   */
  get: (currency, date) => http.get('/v1/fx-rates', { params: { currency, ...(date ? { date } : {}) } }),
};
