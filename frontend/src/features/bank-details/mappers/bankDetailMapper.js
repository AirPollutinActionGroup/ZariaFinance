import { BANK_DETAIL_STATUS_LABEL } from '../constants.js';

/**
 * BankDetailMapper — translates between backend DTOs (BankDetailResponse,
 * CreateBankDetailRequest) and frontend view/form models. Backend field
 * names are preserved verbatim.
 */

/** BankDetailResponse → view model. */
export function fromBankDetailResponse(dto) {
  return {
    ...dto,
    statusLabel: BANK_DETAIL_STATUS_LABEL[dto.status] || dto.status || '—',
  };
}

/** Form values → CreateBankDetailRequest. */
export function toCreateBankDetailRequest(values) {
  return {
    book: values.book,
    bankName: values.bankName.trim(),
    accountNumber: values.accountNumber.trim(),
    ifsc: values.ifsc.trim().toUpperCase(),
    branchName: values.branchName.trim(),
    status: values.status === 'Active',
  };
}
