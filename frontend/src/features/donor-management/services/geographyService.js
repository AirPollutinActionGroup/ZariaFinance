import { geographyApi } from '../api/geographyApi.js';

/**
 * Service for Geography lookups. Maps response lists to select options.
 */
export const geographyService = {
  async listStates() {
    const list = await geographyApi.listStates();
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
