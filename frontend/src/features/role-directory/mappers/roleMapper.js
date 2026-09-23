import { ROLE_STATUS_LABEL } from '../constants.js';

/**
 * RoleMapper — translates between backend DTOs (RoleResponse,
 * CreateRoleRequest) and frontend view/form models. Backend field names are
 * preserved verbatim.
 */

/** RoleResponse → view model. */
export function fromRoleResponse(dto) {
  const limit = Number(dto.userLimit);
  const hasLimit = dto.userLimit !== '' && dto.userLimit != null && !Number.isNaN(limit);
  const assignedCount = dto.assignedUserCount ?? 0;
  return {
    ...dto,
    statusLabel: ROLE_STATUS_LABEL[dto.status] || dto.status || '—',
    userLimitLabel: hasLimit ? `${assignedCount} / ${limit}` : `${assignedCount} / Unlimited`,
    isAtUserLimit: hasLimit && assignedCount >= limit,
  };
}

/** RoleUserResponse → view model (currently pass-through, kept for symmetry). */
export function fromRoleUserResponse(dto) {
  return { ...dto };
}

/** Form values → CreateRoleRequest. */
export function toCreateRoleRequest(values) {
  return {
    roleName: values.roleName.trim(),
    shortName: values.shortName.trim().toLowerCase(),
    userLimit: values.userLimit.trim(),
    permissionRole: values.permissionRole,
  };
}
