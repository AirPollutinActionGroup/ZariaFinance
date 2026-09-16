export const MODULE_ID = 'payment-type';

/**
 * Mirrors the status string produced by backend/.../paymentType/group and
 * .../paymentType/ledger mappers — never rename these keys, they must
 * match the backend responses exactly.
 */
export const PAYMENT_TYPE_STATUS_LABEL = Object.freeze({
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
});
