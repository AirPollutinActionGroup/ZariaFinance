import { roleApi } from '../api/roleApi.js';
import { fromRoleResponse, fromRoleUserResponse, toCreateRoleRequest } from '../mappers/roleMapper.js';

/**
 * Role Directory domain service. All business behaviour lives here; hooks
 * and components call the service, never the repository directly.
 */
export const roleService = {
  async listRoles(search) {
    const dtos = await roleApi.list(search);
    return dtos.map(fromRoleResponse);
  },

  async getRole(id) {
    return fromRoleResponse(await roleApi.getById(id));
  },

  async createRole(formValues) {
    return fromRoleResponse(await roleApi.create(toCreateRoleRequest(formValues)));
  },

  /** Resolves true when shortName is not already registered. */
  async isShortNameAvailable(shortName) {
    const { exists } = await roleApi.verifyShortName(shortName);
    return !exists;
  },

  async activateRole(id) {
    await roleApi.activate(id);
  },

  async deactivateRole(id) {
    await roleApi.deactivate(id);
  },

  async listAssignedUsers(roleId) {
    const dtos = await roleApi.getAssignedUsers(roleId);
    return dtos.map(fromRoleUserResponse);
  },

  async assignUser(roleId, userId) {
    return fromRoleUserResponse(await roleApi.assignUser(roleId, userId));
  },

  async unassignUser(roleId, userId) {
    await roleApi.unassignUser(roleId, userId);
  },
};
