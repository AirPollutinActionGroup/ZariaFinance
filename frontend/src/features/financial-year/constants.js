export const MODULE_ID = 'financial-year';

/**
 * Mirrors the status string produced by
 * backend/.../financialYear/mapper/FinancialYearMapper.java — never rename
 * these keys, they must match the backend response exactly.
 */
export const FINANCIAL_YEAR_STATUS_LABEL = Object.freeze({
  ACTIVE: 'Active',
  UPCOMING: 'Upcoming',
  CLOSED: 'Closed',
});

export const FINANCIAL_YEAR_STATUS_TONE = Object.freeze({
  ACTIVE: 'success',
  UPCOMING: 'info',
  CLOSED: 'neutral',
});
