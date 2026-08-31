import { MASTER_STATUS_LABEL } from '../constants.js';

/**
 * DesignationMapper — translates between backend DTOs (DesignationResponse,
 * CreateDesignationRequest) and frontend view/form models. Backend field
 * names are preserved verbatim.
 */

/** DesignationResponse → view model. */
export function fromDesignationResponse(dto) {
  return {
    ...dto,
    statusLabel: MASTER_STATUS_LABEL[dto.status] || dto.status || '—',
  };
}

/** Form values → CreateDesignationRequest. */
export function toCreateDesignationRequest(values) {
  return {
    name: values.name.trim(),
    departmentId: values.departmentId,
    status: values.status === 'Active',
  };
}
