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

/** Mirrors RestrictionRuleType. */
export const UTILISATION_RULE_TYPES = [
  { value: 'ADMIN_OVERHEAD_COST', label: 'Admin / Overhead Cost', requiresLimit: true },
  { value: 'NOT_APPLICABLE', label: 'Not applicable', requiresLimit: false },
  { value: 'OTHER_CUSTOM', label: 'Other (Custom rule)', requiresLimit: true },
];

/** Mirrors ReportingFrequency. */
export const REPORTING_FREQUENCY_OPTIONS = [
  { value: '', label: '—' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'HALF_YEARLY', label: 'Half-yearly' },
  { value: 'ANNUAL', label: 'Annual' },
];

/** Mirrors DisbursementType. */
export const DISBURSEMENT_TYPE_OPTIONS = [
  { value: 'LUMP_SUM', label: 'Lump sum' },
  { value: 'TRANCHE', label: 'Tranches' },
];

/** Mirrors ScheduleFrequency. */
export const SCHEDULE_FREQUENCY_OPTIONS = [
  { value: 'ONE_TIME', label: 'One time' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'HALF_YEARLY', label: 'Half-Yearly' },
  { value: 'YEARLY', label: 'Yearly' },
];

/** Mirrors CriterionType; humanActioned gates the reminder & escalation block. */
export const CRITERION_TYPE_OPTIONS = [
  { value: 'ON_SIGNING', label: 'On Signing', humanActioned: false },
  { value: 'FIXED_DATE', label: 'Fixed Date', humanActioned: false },
  { value: 'MILESTONE_BASED', label: 'Milestone Based', humanActioned: true },
  { value: 'UTILISATION_THRESHOLD', label: 'Utilisation Threshold', humanActioned: true },
  { value: 'UTILISATION_CERTIFICATE', label: 'Utilisation Certificate (UC)', humanActioned: true },
  { value: 'FINANCIAL_REPORT', label: 'Financial Report', humanActioned: true },
  { value: 'NARRATIVE_REPORT', label: 'Narrative Report', humanActioned: true },
  { value: 'AUDIT_REPORT', label: 'Audit Report', humanActioned: true },
  { value: 'DONOR_APPROVAL', label: 'Donor Approval', humanActioned: true },
  { value: 'OTHER', label: 'Other', humanActioned: false },
];

export function isCriterionHumanActioned(criterionType) {
  return CRITERION_TYPE_OPTIONS.find((t) => t.value === criterionType)?.humanActioned ?? false;
}

/** Mirrors ApproverRole; used for both sign-off and reminder-responsible roles. */
export const APPROVER_ROLE_OPTIONS = [
  { value: 'PROGRAMME_MANAGER', label: 'Programme Manager' },
  { value: 'CFO', label: 'CFO' },
  { value: 'HEAD_OF_ORGANISATION', label: 'Head of Organisation' },
  { value: 'OTHER', label: 'Other' },
];

/** Free-text on the backend — these are just sensible UI defaults, not an enum contract. */
export const TRIGGER_BASE_OPTIONS = [
  { value: 'PREVIOUS_TRANCHE', label: 'Previous Tranche' },
  { value: 'CUMULATIVE', label: 'Cumulative' },
];

export const REPEAT_REMINDER_OPTIONS = [
  { value: 'ONCE', label: 'Once' },
  { value: 'EVERY_3_DAYS', label: 'Every 3 days' },
  { value: 'WEEKLY', label: 'Weekly until actioned' },
];
