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

/** Grant lifecycle is a plain isActive boolean now (no multi-step status), mirroring DonorMaster. */
export const GRANT_ACTIVE_TONE = Object.freeze({
  true: 'success',
  false: 'neutral',
});

/**
 * `GrantAgreement.isApproved` — the approval workflow, separate from isActive
 * (backend/finance .../entity/GrantAgreement.java).
 * 1 = approved, 2 = pending, 3 = on hold, 4 = completed.
 */
export const GRANT_APPROVAL_STATUS = Object.freeze({
  1: 'Approved',
  2: 'Pending',
  3: 'On Hold',
  4: 'Completed',
});

export const GRANT_APPROVAL_STATUS_TONE = Object.freeze({
  1: 'success',
  2: 'warning',
  3: 'warning',
  4: 'info',
});

/** Foreign-sourced funds are flagged distinctly for the FCRA register. */
export const FUND_SOURCE_DOMICILE_TONE = Object.freeze({
  DOMESTIC: 'neutral',
  FOREIGN: 'graphite',
});
