import { DOCUMENT_TYPE } from '../constants.js';

/** DocumentMapper — DocumentResponse ↔ view model, form → UploadDocumentRequest. */

export function fromDocumentResponse(dto) {
  return {
    ...dto,
    documentTypeLabel: DOCUMENT_TYPE[dto.documentType] || dto.documentType || '—',
  };
}

export function toUploadDocumentRequest(values) {
  return {
    grantId: Number(values.grantId),
    documentName: values.documentName.trim(),
    documentType: values.documentType,
    documentPath: values.documentPath?.trim() || null,
  };
}
