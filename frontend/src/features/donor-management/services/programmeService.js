import { programmeApi } from '../api/programmeApi.js';

/**
 * Programme domain service. Field names match the backend DTOs verbatim
 * (programmeCode/programmeName/description/isActive), so no mapper layer
 * is needed — components and hooks call this service, never the repository
 * directly.
 */
export const programmeService = {
  async listProgrammes() {
    return programmeApi.list();
  },

  async getProgramme(id) {
    return programmeApi.getById(id);
  },

  async createProgramme(formValues) {
    return programmeApi.create({
      programmeName: formValues.programmeName.trim(),
      description: formValues.description?.trim() || null,
      isActive: formValues.isActive,
    });
  },

  async activateProgramme(id) {
    await programmeApi.activate(id);
  },

  async deactivateProgramme(id) {
    await programmeApi.deactivate(id);
  },
};
