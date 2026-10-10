export const MODULE_ID = 'outflow-budget';

/** Funding-source language for a budget line. */
export const FUNDING_SOURCE_TYPE = Object.freeze({
  RESTRICTED: 'Restricted',
  UNRESTRICTED: 'Unrestricted',
  CORPUS: 'Corpus',
});

export const FUNDING_SOURCE_TONE = Object.freeze({
  RESTRICTED: 'warning',
  UNRESTRICTED: 'neutral',
  CORPUS: 'info',
});

/** Row status from the server: PAID = fully spent (debit notes − credit notes ≥ budgeted). */
export const PAYMENT_STATUS = Object.freeze({
  PAID: 'Fully spent',
  DUE: 'Due',
  PENDING: 'Pending',
  OVERDUE: 'Overdue',
});

export const PAYMENT_STATUS_TONE = Object.freeze({
  PAID: 'success',
  DUE: 'neutral',
  PENDING: 'warning',
  OVERDUE: 'error',
});

/** Days past the quarter's end before an unspent row is Overdue rather than Pending (server uses the same). */
export const OVERDUE_THRESHOLD_DAYS = 15;
