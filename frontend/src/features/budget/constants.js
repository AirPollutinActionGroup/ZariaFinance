import { financialYearOf, financialYearOptions } from './lib/financialYear.js';

/** Approval lifecycle of a budget: Draft → Submitted → Approved | Rejected (→ back to Draft on edit). */
export const BUDGET_STATUS = Object.freeze({
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
});

export const BUDGET_STATUS_TONE = Object.freeze({
  DRAFT: 'neutral',
  SUBMITTED: 'info',
  APPROVED: 'success',
  REJECTED: 'error',
});

/**
 * What a budget is planned for: one programme, or the organisation as a whole
 * (overheads, admin, shared costs). Either can be tied to one State.
 */
export const BUDGET_TYPE = Object.freeze({
  PROGRAMME: 'Programme-based',
  ORGANISATION: 'Organisation-based',
});

export const BUDGET_TYPE_HINT = Object.freeze({
  PROGRAMME: 'Planned for a single programme — its activities, staff and restricted grant spend.',
  ORGANISATION: 'Planned for the organisation as a whole — overheads, admin and shared costs.',
});

export const BUDGET_TYPE_TONE = Object.freeze({ PROGRAMME: 'info', ORGANISATION: 'graphite' });

/** Budgets saved before types existed were all programme budgets. */
export const budgetTypeOf = (budget) => budget?.budgetType || 'PROGRAMME';

/** Scope label for an organisation budget. */
export const ORGANISATION_WIDE = 'Organisation-wide';

/** Indian FY quarters — a line's amount is phased across these. */
export const QUARTERS = Object.freeze([
  { key: 'q1', label: 'Q1', months: 'Apr–Jun' },
  { key: 'q2', label: 'Q2', months: 'Jul–Sep' },
  { key: 'q3', label: 'Q3', months: 'Oct–Dec' },
  { key: 'q4', label: 'Q4', months: 'Jan–Mar' },
]);

/** Previous / current / next FY from today's date, until the budget screen is wired to the Financial Year API. */
export const FINANCIAL_YEARS = Object.freeze(financialYearOptions());
export const CURRENT_FINANCIAL_YEAR = financialYearOf();
