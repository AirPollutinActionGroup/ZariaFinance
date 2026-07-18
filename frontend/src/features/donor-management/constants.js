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

/** Tone for the fund-profile restriction class A/B/C (distinct from FUND_CLASS_TONE). */
export const FUND_CLASS_CODE_TONE = Object.freeze({
  A: 'error',
  B: 'warning',
  C: 'success',
});

/**
 * Restriction-class meanings, surfaced via the info icon on the Donor Register.
 * Definitions are taken verbatim in substance from the Donor Fund Typology
 * reference sheet (Fund Behaviour Classes — System Model).
 */
export const FUND_CLASS_CODE_LABEL = Object.freeze({
  A: 'Class A — Fully Restricted: funds are locked to a defined project and a pre-approved budget. No reallocation across budget lines is permitted; any expenditure outside the defined scope is a compliance violation.',
  B: 'Class B — Unrestricted with Explanation: funds are untied but governed by utilisation context. Budget-line movement is allowed, but each movement must be accompanied by a mandatory explanation recorded as an audit entry.',
  C: 'Class C — Fully Unrestricted: funds are completely untied. No project assignment, programme restriction, or movement explanation is required; they can be allocated freely across any programme or operational need.',
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
