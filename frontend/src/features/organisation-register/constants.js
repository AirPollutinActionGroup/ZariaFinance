export const MODULE_ID = 'organisation-register';

/**
 * Mirrors backend/finance/.../organizationRegister/enums/OrganisationStatus.java —
 * never rename these keys, they must match the Java enum values exactly.
 */
export const ORGANISATION_STATUS_LABEL = Object.freeze({
  ACTIVE: 'Active',
  PENDING: 'Pending',
  INACTIVE: 'Inactive',
});

export const ORGANISATION_STATUS_TONE = Object.freeze({
  ACTIVE: 'success',
  PENDING: 'warning',
  INACTIVE: 'neutral',
});
