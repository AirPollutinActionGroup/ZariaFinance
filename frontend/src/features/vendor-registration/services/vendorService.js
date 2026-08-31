import { vendorApi } from '../api/vendorApi.js';
import { fromVendorResponse, toCreateVendorRequest } from '../mappers/vendorMapper.js';

/**
 * Vendor Register domain service. All business behaviour lives here; hooks
 * and components call the service, never the repository directly.
 */
export const vendorService = {
  async listVendors(search) {
    const dtos = await vendorApi.list(search);
    return dtos.map(fromVendorResponse);
  },

  async getVendor(id) {
    return fromVendorResponse(await vendorApi.getById(id));
  },

  async createVendor(formValues) {
    return fromVendorResponse(await vendorApi.create(toCreateVendorRequest(formValues)));
  },

  async activateVendor(id) {
    await vendorApi.activate(id);
  },

  async deactivateVendor(id) {
    await vendorApi.deactivate(id);
  },
};
