import { PAYMENT_MODE_STATUS_LABEL } from '../constants.js';

/**
 * PaymentModeMapper — translates between backend DTOs (PaymentModeResponse,
 * CreatePaymentModeRequest) and frontend view/form models. Backend field
 * names are preserved verbatim.
 */

/** PaymentModeResponse → view model. */
export function fromPaymentModeResponse(dto) {
  return {
    ...dto,
    statusLabel: PAYMENT_MODE_STATUS_LABEL[dto.status] || dto.status || '—',
  };
}

/** Form values → CreatePaymentModeRequest. */
export function toCreatePaymentModeRequest(values) {
  return {
    name: values.name.trim(),
    status: values.status === 'Active',
  };
}
