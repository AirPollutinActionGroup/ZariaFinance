import { programmeApi } from '../api/programmeApi.js';

/**
 * Programme domain service. Field names match the backend DTOs verbatim —
 * components and hooks call this service, never the repository directly.
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
      type: formValues.type,
      parentProgrammeId: formValues.type === 'Project' ? formValues.parentProgrammeId : null,
      startDate: formValues.startDate || null,
      endDate: formValues.endDate || null,
      stateIds: formValues.stateIds || [],
      cityIds: formValues.cityIds || [],
      status: formValues.status,
    });
  },

  async activateProgramme(id) {
    await programmeApi.activate(id);
  },

  async deactivateProgramme(id) {
    await programmeApi.deactivate(id);
  },

  async updateProgrammeStatus(id, status) {
    return programmeApi.updateStatus(id, status);
  },
};
