import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/debit-notes (DebitNoteController). Notes are
 * addressed by code, e.g. DN-2026-001.
 */
export const debitNoteApi = {
  /** GET /api/v1/debit-notes → NoteResponse[] (newest first). */
  list: () => http.get('/v1/debit-notes'),

  /** GET /api/v1/debit-notes/{code} → NoteResponse. */
  getByCode: (code) => http.get(`/v1/debit-notes/${encodeURIComponent(code)}`),

  /** POST /api/v1/debit-notes — body: CreateDebitNoteRequest → NoteResponse (201). */
  create: (payload) => http.post('/v1/debit-notes', payload),
};
