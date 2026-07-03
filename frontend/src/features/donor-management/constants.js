/**
 * Frontend mirror of backend enums. Values MUST match the Java enums in
 * backend/finance/src/main/java/com/ngo/finance/donor/enums exactly —
 * never rename; labels mirror each enum's label field.
 */

export const MODULE_ID = 'donor-management';

export const FUND_CLASS = Object.freeze({
  DOMESTIC: 'Domestic',
  INTERNATIONAL: 'International',
  GOVERNMENT: 'Government',
  CORPORATE: 'Corporate',
  INDIVIDUAL: 'Individual',
  NGO: 'NGO',
});

export const DONOR_STATUS = Object.freeze({
  DRAFT: 'Draft',
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED: 'Approved',
  ONBOARDED: 'Onboarded',
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended',
  TERMINATED: 'Terminated',
});

export const GRANT_STATUS = Object.freeze({
  DRAFT: 'Draft',
  PENDING_APPROVAL: 'Pending Approval',
  APPROVED: 'Approved',
  ACTIVE: 'Active',
  ON_HOLD: 'On Hold',
  COMPLETED: 'Completed',
  TERMINATED: 'Terminated',
  CLOSED: 'Closed',
});

export const DOCUMENT_TYPE = Object.freeze({
  AGREEMENT: 'Agreement',
  MOU: 'MOU',
  FINANCIAL_STATEMENT: 'Financial Statement',
  AUDIT_REPORT: 'Audit Report',
  REPORT: 'Report',
  DISBURSEMENT: 'Disbursement',
  UTILIZATION: 'Utilization',
  OTHER: 'Other',
});

/** enum object → [{value, label}] for selects. */
export function toOptions(enumMap) {
  return Object.entries(enumMap).map(([value, label]) => ({ value, label }));
}

/** UI tone mapping for StatusChip (presentation concern, single source). */
export const DONOR_STATUS_TONE = Object.freeze({
  DRAFT: 'neutral',
  PENDING_APPROVAL: 'warning',
  APPROVED: 'info',
  ONBOARDED: 'info',
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  SUSPENDED: 'warning',
  TERMINATED: 'error',
});

export const GRANT_STATUS_TONE = Object.freeze({
  DRAFT: 'neutral',
  PENDING_APPROVAL: 'warning',
  APPROVED: 'info',
  ACTIVE: 'success',
  ON_HOLD: 'warning',
  COMPLETED: 'success',
  TERMINATED: 'error',
  CLOSED: 'neutral',
});

/** International money is flagged like "Foreign · FCRA" in the register. */
export const FUND_CLASS_TONE = Object.freeze({
  DOMESTIC: 'neutral',
  INTERNATIONAL: 'graphite',
  GOVERNMENT: 'outlined',
  CORPORATE: 'outlined',
  INDIVIDUAL: 'neutral',
  NGO: 'outlined',
});
