import { MASTER_STATUS_LABEL } from '../constants.js';

/**
 * DepartmentMapper — translates between backend DTOs (DepartmentResponse,
 * CreateDepartmentRequest) and frontend view/form models. Backend field
 * names are preserved verbatim.
 */

/** DepartmentResponse → view model. */
export function fromDepartmentResponse(dto) {
  return {
    ...dto,
    statusLabel: MASTER_STATUS_LABEL[dto.status] || dto.status || '—',
  };
}

/** Form values → CreateDepartmentRequest. */
export function toCreateDepartmentRequest(values) {
  return {
    name: values.name.trim(),
    status: values.status === 'Active',
  };
}
