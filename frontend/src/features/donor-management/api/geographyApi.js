import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/geography (GeographyController).
 */
export const geographyApi = {
  /** GET /api/v1/geography/states → StateLookupResponse[]. */
  listStates: () => http.get('/v1/geography/states'),

  /** GET /api/v1/geography/cities[?stateId=] → CityLookupResponse[]. */
  listCities: (stateId) =>
    http.get('/v1/geography/cities', { params: stateId ? { stateId } : undefined }),
};
