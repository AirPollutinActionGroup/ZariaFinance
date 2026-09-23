export const MODULE_ID = 'role-directory';

/**
 * Mirrors backend/finance/.../roleDirectory/enums/RoleStatus.java — never
 * rename these keys, they must match the Java enum values exactly.
 */
export const ROLE_STATUS_LABEL = Object.freeze({
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
});

export const ROLE_STATUS_TONE = Object.freeze({
  ACTIVE: 'success',
  INACTIVE: 'neutral',
});

/**
 * The 3 access tiers a custom role can grant at login — mirrors
 * frontend/src/core/permissions/permissions.js ROLES exactly.
 */
export const PERMISSION_ROLE_OPTIONS = [
  { value: 'CEO', label: 'CEO (view + comment everywhere)' },
  { value: 'FINANCE_OFFICER', label: 'Finance Officer (full edit + approve everywhere)' },
  { value: 'FUNDRAISING_LEAD', label: 'Fundraising Lead (limited modules)' },
];

export const PERMISSION_ROLE_LABEL = Object.freeze({
  CEO: 'CEO',
  FINANCE_OFFICER: 'Finance Officer',
  FUNDRAISING_LEAD: 'Fundraising Lead',
});
