import { donorApi } from '../api/donorApi.js';
import {
  fromDonorResponse,
  toCreateDonorRequest,
  toUpdateDonorRequest,
} from '../mappers/donorMapper.js';

/**
 * Donor domain service. All donor business behaviour lives here; hooks and
 * components call the service, never the repository directly.
 */
export const donorService = {
  async listDonors(search) {
    const dtos = await donorApi.list(search);
    return dtos.map(fromDonorResponse);
  },

  async getDonor(id) {
    return fromDonorResponse(await donorApi.getById(id));
  },

  async createDonor(formValues) {
    return fromDonorResponse(await donorApi.create(toCreateDonorRequest(formValues)));
  },

  async updateDonor(id, formValues) {
    return fromDonorResponse(await donorApi.update(id, toUpdateDonorRequest(formValues)));
  },

  async activateDonor(id) {
    await donorApi.activate(id);
  },

  async deactivateDonor(id) {
    await donorApi.deactivate(id);
  },
};
