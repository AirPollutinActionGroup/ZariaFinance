import { FINANCIAL_YEAR_STATUS_LABEL } from '../constants.js';

/**
 * FinancialYearMapper — translates between backend DTOs (FinancialYearResponse,
 * CreateFinancialYearRequest) and frontend view/form models. Backend field
 * names are preserved verbatim.
 */

/** FinancialYearResponse → view model. */
export function fromFinancialYearResponse(dto) {
  return {
    ...dto,
    statusLabel: FINANCIAL_YEAR_STATUS_LABEL[dto.status] || dto.status || '—',
  };
}

/** Form values → CreateFinancialYearRequest. */
export function toCreateFinancialYearRequest(values) {
  return {
    code: values.code.trim(),
    startDate: values.startDate,
    endDate: values.endDate,
    current: Boolean(values.current),
  };
}
