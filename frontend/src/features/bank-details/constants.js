export const MODULE_ID = 'bank-details';

/**
 * Mirrors the status string produced by
 * backend/.../bankDetails/mapper/BankDetailMapper.java — never rename
 * these keys, they must match the backend response exactly.
 */
export const BANK_DETAIL_STATUS_LABEL = Object.freeze({
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
});
