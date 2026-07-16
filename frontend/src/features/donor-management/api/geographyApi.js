import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/geography (GeographyController).
 */
export const geographyApi = {
  /** GET /api/v1/geography/countries → CountryLookupResponse[]. */
  listCountries: () => http.get('/v1/geography/countries'),

  /** GET /api/v1/geography/states[?countryId=] → StateLookupResponse[]. */
  listStates: (countryId) =>
    http.get('/v1/geography/states', { params: countryId ? { countryId } : undefined }),

  /** GET /api/v1/geography/cities[?stateId=] → CityLookupResponse[]. */
  listCities: (stateId) =>
    http.get('/v1/geography/cities', { params: stateId ? { stateId } : undefined }),
};
