export const CREDIT_NOTE_STATUS = Object.freeze({
  ISSUED: 'Issued',
  CANCELLED: 'Cancelled',
});

export const CREDIT_NOTE_STATUS_TONE = Object.freeze({
  ISSUED: 'success',
  CANCELLED: 'neutral',
});

export const ATTACHMENT_ACCEPT = '.pdf,.jpg,.jpeg,.png';
export const ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024;

/** Why money came back against a budget line. Always asked for. */
export const CREDIT_NOTE_REASON = Object.freeze({
  REFUND: 'Refund',
  OVERCHARGE: 'Overcharge reversal',
  DISCOUNT: 'Discount / rebate',
  GOODS_RETURNED: 'Goods returned',
  FX_DIFFERENCE: 'FX difference',
  TAX_ADJUSTMENT: 'Tax / GST adjustment',
  OTHER: 'Other',
});

export const reasonLabel = (code) => CREDIT_NOTE_REASON[code] || '';
