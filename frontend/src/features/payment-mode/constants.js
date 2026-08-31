export const MODULE_ID = 'payment-mode';

/**
 * Mirrors the status string produced by
 * backend/.../paymentMode/mapper/PaymentModeMapper.java — never rename
 * these keys, they must match the backend response exactly.
 */
export const PAYMENT_MODE_STATUS_LABEL = Object.freeze({
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
});

export const PAYMENT_MODE_STATUS_TONE = Object.freeze({
  ACTIVE: 'success',
  INACTIVE: 'neutral',
});
