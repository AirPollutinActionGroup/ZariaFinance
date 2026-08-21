import { USER_REQUEST_STATUS_LABEL } from '../constants.js';

/**
 * UserRequestMapper — translates UserRegisterResponse (backend DTO) into
 * the view model the list/detail pages render. Backend field names are
 * preserved verbatim alongside the derived display fields.
 */

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

const formatDateTime = (value) => (value ? dateTimeFormatter.format(new Date(value)) : '—');

/** UserRegisterResponse → view model. */
export function fromUserRequestResponse(dto) {
  return {
    ...dto,
    name: [dto.firstName, dto.lastName].filter(Boolean).join(' '),
    email: dto.emailId,
    phone: dto.mobileNo,
    role: dto.roleName || '—',
    organisation: dto.organisationName || '—',
    statusLabel: USER_REQUEST_STATUS_LABEL[dto.approvalStatus] || dto.approvalStatus || '—',
    createdAtLabel: formatDateTime(dto.createdAt),
  };
}
