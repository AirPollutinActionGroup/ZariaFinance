import { PAYMENT_TYPE_STATUS_LABEL } from '../constants.js';

/**
 * PaymentTypeGroupMapper — translates between backend DTOs
 * (PaymentTypeGroupResponse, CreatePaymentTypeGroupRequest) and frontend
 * view/form models. Backend field names are preserved verbatim.
 */

/** PaymentTypeGroupResponse → view model. */
export function fromPaymentTypeGroupResponse(dto) {
  return {
    ...dto,
    statusLabel: PAYMENT_TYPE_STATUS_LABEL[dto.status] || dto.status || '—',
  };
}

/** Form values → CreatePaymentTypeGroupRequest. */
export function toCreatePaymentTypeGroupRequest(values) {
  return {
    name: values.name.trim(),
    status: values.status === 'Active',
  };
}
