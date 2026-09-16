import { PAYMENT_TYPE_STATUS_LABEL } from '../constants.js';

/**
 * PaymentTypeLedgerMapper — translates between backend DTOs
 * (PaymentTypeLedgerResponse, CreatePaymentTypeLedgerRequest) and frontend
 * view/form models. Backend field names are preserved verbatim.
 */

/** PaymentTypeLedgerResponse → view model. */
export function fromPaymentTypeLedgerResponse(dto) {
  return {
    ...dto,
    statusLabel: PAYMENT_TYPE_STATUS_LABEL[dto.status] || dto.status || '—',
  };
}

/** Form values → CreatePaymentTypeLedgerRequest. */
export function toCreatePaymentTypeLedgerRequest(values) {
  return {
    name: values.name.trim(),
    groupId: values.groupId,
    status: values.status === 'Active',
  };
}
