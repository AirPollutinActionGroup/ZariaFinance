import { documentTypeApi } from '../api/documentTypeApi.js';
import { MASTER_STATUS_LABEL } from '../constants.js';

/** DocumentTypeResponse → view model. */
const fromResponse = (dto) => ({
  ...dto,
  statusLabel: MASTER_STATUS_LABEL[dto.status] || dto.status || '—',
  allowedFundSourceDomiciles: dto.allowedFundSourceDomiciles || [],
});

/**
 * Whether a document type can be used by a donor with this fund source
 * domicile (DOMESTIC | FOREIGN). A type with no domiciles applies to both;
 * with no domicile chosen yet, every type is offered.
 */
export function documentTypeAppliesTo(type, domicile) {
  const allowed = type.allowedFundSourceDomiciles || [];
  return !domicile || allowed.length === 0 || allowed.includes(domicile);
}

/**
 * Document Type master — the identity documents a donor can be identified by
 * (PAN Card, Aadhaar Card, …). Donors store the `code`.
 */
export const documentTypeService = {
  async listDocumentTypes(search) {
    return (await documentTypeApi.list(search)).map(fromResponse);
  },

  /** Active types only — for the donor form's dropdown. */
  async listActiveDocumentTypes() {
    return (await documentTypeApi.list('', true)).map(fromResponse);
  },

  async createDocumentType(values) {
    return fromResponse(
      await documentTypeApi.create({
        name: values.name.trim(),
        code: values.code?.trim() || undefined,
        status: values.status !== 'INACTIVE',
        allowedFundSourceDomiciles: values.allowedFundSourceDomiciles || [],
      }),
    );
  },

  async updateDocumentType(id, values) {
    return fromResponse(
      await documentTypeApi.update(id, {
        name: values.name.trim(),
        allowedFundSourceDomiciles: values.allowedFundSourceDomiciles || [],
      }),
    );
  },

  async activateDocumentType(id) {
    await documentTypeApi.activate(id);
  },

  async deactivateDocumentType(id) {
    await documentTypeApi.deactivate(id);
  },
};
