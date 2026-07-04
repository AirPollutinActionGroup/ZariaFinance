import { z } from 'zod';
import { DOCUMENT_TYPE } from '../constants.js';

/** Mirrors UploadDocumentRequest bean validation. */
export const documentSchema = z.object({
  documentName: z.string().trim().min(1, 'Document name is required'),
  documentType: z.enum(Object.keys(DOCUMENT_TYPE), { message: 'Document type is required' }),
  documentPath: z.string().trim().optional().or(z.literal('')),
});

export const documentFormDefaults = {
  documentName: '',
  documentType: '',
  documentPath: '',
};
