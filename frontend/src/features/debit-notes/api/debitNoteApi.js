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

  /**
   * GET /api/v1/debit-notes/suggestions → FundSuggestionResponse: the top 10
   * donor funds for a note on this outflow row, plus the funds left out and why.
   * amount, date (YYYY-MM-DD) and book (LC / FC) are optional.
   */
  suggestions: ({ outflowLineId, amount, date, book }) =>
    http.get('/v1/debit-notes/suggestions', {
      params: {
        outflowLineId,
        ...(amount > 0 ? { amount } : {}),
        ...(date ? { date } : {}),
        ...(book ? { book } : {}),
      },
    }),

  /** POST /api/v1/debit-notes — body: CreateDebitNoteRequest → NoteResponse (201). */
  create: (payload) => http.post('/v1/debit-notes', payload),
};
