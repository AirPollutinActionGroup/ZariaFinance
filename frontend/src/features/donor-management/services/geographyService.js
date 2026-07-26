import { geographyApi } from '../api/geographyApi.js';

/**
 * Service for Geography lookups. Maps response lists to select options.
 */
export const geographyService = {
  async listCountries() {
    const list = await geographyApi.listCountries();
    return list.map((country) => ({
      value: country.id,
      label: country.countryName,
    }));
  },

  async listStates(countryId) {
    const list = await geographyApi.listStates(countryId);
    return list.map((state) => ({
      value: state.id,
      label: state.stateName,
    }));
  },

  async listCities(stateId) {
    const list = await geographyApi.listCities(stateId);
    return list.map((city) => ({
      value: city.id,
      label: city.cityName,
    }));
  },
};
