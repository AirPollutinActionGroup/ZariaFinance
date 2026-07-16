/**
 * Frontend mirror of backend enums. Values MUST match the Java enums in
 * backend/finance/src/main/java/com/ngo/finance/donor/enums exactly —
 * never rename; labels mirror each enum's label field.
 */

export const MODULE_ID = 'donor-management';

export const DONOR_TYPE = Object.freeze({
  CORPORATE: 'Corporate CSR',
  INDIVIDUAL: 'Individual',
  FOUNDATION: 'Foundation',
  GOVERNMENT: 'Government',
});

export const FUND_SOURCE_DOMICILE = Object.freeze({
  DOMESTIC: 'Domestic',
  FOREIGN: 'Foreign',
});

/** Donor lifecycle is a plain isActive boolean now (no multi-step status). */
export const DONOR_ACTIVE_TONE = Object.freeze({
  true: 'success',
  false: 'neutral',
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

/** Tone for the fund-profile restriction class A/B/C. */
export const FUND_CLASS_CODE_TONE = Object.freeze({
  A: 'error',
  B: 'warning',
  C: 'success',
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

/** Foreign-sourced funds are flagged distinctly for the FCRA register. */
export const FUND_SOURCE_DOMICILE_TONE = Object.freeze({
  DOMESTIC: 'neutral',
  FOREIGN: 'graphite',
});
