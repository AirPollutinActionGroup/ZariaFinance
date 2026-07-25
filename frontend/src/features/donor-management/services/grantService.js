import { grantApi } from '../api/grantApi.js';
import {
  fromGrantDetailsResponse,
  fromGrantListResponse,
  toCreateGrantRequest,
  toGrantFormValues,
} from '../mappers/grantMapper.js';

/** Grant domain service: lifecycle + aggregation logic for grant agreements. */
export const grantService = {
  async listGrants(filters) {
    const dtos = await grantApi.list(filters);
    return dtos.map(fromGrantListResponse);
  },

  async getGrant(id) {
    return fromGrantDetailsResponse(await grantApi.getById(id));
  },

  async createGrant(formValues) {
    return fromGrantDetailsResponse(await grantApi.create(toCreateGrantRequest(formValues)));
  },

  async updateGrant(id, formValues) {
    return fromGrantDetailsResponse(await grantApi.update(id, toCreateGrantRequest(formValues)));
  },

  /** GrantDetailsResponse view model → edit-form values. */
  toFormValues(grant) {
    return toGrantFormValues(grant);
  },

  async approveGrant(id, { approvedBy, remarks } = {}) {
    await grantApi.approve(id, { approvedBy, remarks });
  },

  async activateGrant(id) {
    await grantApi.activate(id);
  },

  async closeGrant(id) {
    await grantApi.close(id);
  },

  async holdGrant(id, { remarks } = {}) {
    await grantApi.hold(id, { remarks });
  },

  async resumeGrant(id) {
    await grantApi.resume(id);
  },

  async completeGrant(id) {
    await grantApi.complete(id);
  },

  /**
   * Lifecycle actions available for a grant, mirroring GrantController's
   * transitions (approve, activate, close, hold, resume, complete). Driven by
   * isApproved (1 = approved, 2 = pending, 3 = on hold, 4 = completed) and
   * isActive, not a status enum. Completed is terminal — no further actions.
   */
  availableActions(isApproved, isActive) {
    if (isApproved === 2) return ['approve'];
    if (isApproved === 1) return isActive ? ['hold', 'complete', 'close'] : ['activate'];
    if (isApproved === 3) return ['resume'];
    return [];
  },
};
