import { employeeAllocationApi } from '../api/employeeAllocationApi.js';

/**
 * Employee Allocation domain service. Field names match the backend DTOs
 * verbatim — components and hooks call this service, never the repository
 * directly.
 */
export const employeeAllocationService = {
  async listAllocations() {
    return employeeAllocationApi.list();
  },

  async createAllocation(formValues) {
    return employeeAllocationApi.create({
      employeeId: formValues.employeeId,
      programmeId: formValues.programmeId,
      projectId: formValues.projectId,
      role: formValues.role?.trim() || null,
      stateIds: formValues.stateIds || [],
      cityIds: formValues.cityIds || [],
      allocationPct: Number(formValues.allocationPct),
      startDate: formValues.startDate || null,
      endDate: formValues.endDate || null,
      remark: formValues.remark?.trim() || null,
    });
  },

  async removeAllocation(id) {
    await employeeAllocationApi.remove(id);
  },
};
