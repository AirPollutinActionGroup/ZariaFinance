import { documentApi } from '../api/documentApi.js';
import { fromDocumentResponse, toUploadDocumentRequest } from '../mappers/documentMapper.js';

/** Grant document service. */
export const documentService = {
  async listByGrant(grantId, documentName) {
    const dtos = await documentApi.listByGrant(grantId, documentName);
    return dtos.map(fromDocumentResponse);
  },

  async uploadDocument(formValues) {
    return fromDocumentResponse(await documentApi.upload(toUploadDocumentRequest(formValues)));
  },

  async deleteDocument(id) {
    await documentApi.remove(id);
  },
};
