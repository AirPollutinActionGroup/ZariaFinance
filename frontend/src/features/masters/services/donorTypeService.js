import { donorTypeApi } from '../api/donorTypeApi.js';
import { fromDonorTypeResponse, toCreateDonorTypeRequest } from '../mappers/donorTypeMapper.js';

/**
 * Donor Type domain service. All business behaviour lives here; hooks
 * and components call the service, never the repository directly.
 */
export const donorTypeService = {
  async listDonorTypes(search) {
    const dtos = await donorTypeApi.list(search);
    return dtos.map(fromDonorTypeResponse);
  },

  async createDonorType(formValues) {
    return fromDonorTypeResponse(await donorTypeApi.create(toCreateDonorTypeRequest(formValues)));
  },

  async activateDonorType(id) {
    await donorTypeApi.activate(id);
  },

  async deactivateDonorType(id) {
    await donorTypeApi.deactivate(id);
  },
};
