import { designationApi } from '../api/designationApi.js';
import { fromDesignationResponse, toCreateDesignationRequest } from '../mappers/designationMapper.js';

/**
 * Designation domain service. All business behaviour lives here; hooks
 * and components call the service, never the repository directly.
 */
export const designationService = {
  async listDesignations(search) {
    const dtos = await designationApi.list(search);
    return dtos.map(fromDesignationResponse);
  },

  async createDesignation(formValues) {
    return fromDesignationResponse(await designationApi.create(toCreateDesignationRequest(formValues)));
  },

  async activateDesignation(id) {
    await designationApi.activate(id);
  },

  async deactivateDesignation(id) {
    await designationApi.deactivate(id);
  },
};
