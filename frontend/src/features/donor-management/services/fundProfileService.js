import { fundProfileApi } from '../api/fundProfileApi.js';
import {
  fromFundProfileResponse,
  toFundProfileRequest,
} from '../mappers/fundProfileMapper.js';

/**
 * Fund Profile domain service. Hooks/components call the service, never the
 * repository directly.
 */
export const fundProfileService = {
  async listByDonor(donorId) {
    const dtos = await fundProfileApi.listByDonor(donorId);
    return dtos.map(fromFundProfileResponse);
  },

  async getProfile(id) {
    return fromFundProfileResponse(await fundProfileApi.getById(id));
  },

  async createProfile(donorId, formValues) {
    return fromFundProfileResponse(
      await fundProfileApi.create(donorId, toFundProfileRequest(formValues)),
    );
  },

  async updateProfile(id, formValues) {
    return fromFundProfileResponse(
      await fundProfileApi.update(id, toFundProfileRequest(formValues)),
    );
  },
};
