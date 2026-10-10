export const ATTACHMENT_ACCEPT = '.pdf,.jpg,.jpeg,.png';
export const ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024;

/** Who a debit note pays. */
export const PAYEE_CATEGORIES = [
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'VENDOR', label: 'Vendor' },
];

/** Why extra money went out against a budget line. */
export const DEBIT_NOTE_REASON = Object.freeze({
  ADDITIONAL_CHARGE: 'Additional charge',
  FX_DIFFERENCE: 'FX difference',
  PRICE_REVISION: 'Price revision',
  TAX_ADJUSTMENT: 'Tax / GST adjustment',
  OTHER: 'Other',
});

/** Reason label, or '' for notes within budget (no reason was asked for). */
export const reasonLabel = (code) => DEBIT_NOTE_REASON[code] || '';
