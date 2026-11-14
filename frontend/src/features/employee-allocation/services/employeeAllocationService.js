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
      projectId: formValues.projectId || null,
      role: formValues.role?.trim() || null,
      stateIds: formValues.stateIds || [],
      cityIds: formValues.cityIds || [],
      allocationPct: Number(formValues.allocationPct),
      startDate: formValues.startDate || null,
      endDate: formValues.endDate || null,
      remark: formValues.remark?.trim() || null,
    });
  },

  /** Ends an allocation (today when no date is given). It stays on record and in the history. */
  async endAllocation(id, { endDate, note } = {}) {
    return employeeAllocationApi.end(id, { endDate: endDate || null, note: note?.trim() || null });
  },

  /** Deletes an allocation made by mistake. The removal is kept in the history. */
  async removeAllocation(id, note) {
    await employeeAllocationApi.remove(id, note?.trim() || undefined);
  },

  async getHistory(employeeId) {
    return employeeAllocationApi.history(employeeId);
  },
};

/** An allocation still counts toward the 100% until its end date has passed. */
export const isActiveAllocation = (allocation) => allocation.active !== false;
