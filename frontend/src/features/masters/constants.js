export const MODULE_ID = 'masters';

/**
 * Mirrors the status string produced by backend/.../masters/department and
 * .../masters/designation mappers — never rename these keys, they must
 * match the backend responses exactly.
 */
export const MASTER_STATUS_LABEL = Object.freeze({
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
});
