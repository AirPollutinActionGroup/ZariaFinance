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

  async approveGrant(id) {
    await grantApi.approve(id);
  },

  async activateGrant(id) {
    await grantApi.activate(id);
  },

  async closeGrant(id) {
    await grantApi.close(id);
  },

  /**
   * Lifecycle actions available for a grant in a given status, mirroring
   * GrantController's transitions (approve, activate, close).
   */
  availableActions(grantStatus) {
    switch (grantStatus) {
      case 'DRAFT':
      case 'PENDING_APPROVAL':
        return ['approve'];
      case 'APPROVED':
        return ['activate', 'close'];
      case 'ACTIVE':
      case 'ON_HOLD':
        return ['close'];
      default:
        return [];
    }
  },
};
