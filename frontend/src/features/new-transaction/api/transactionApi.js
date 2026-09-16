import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/transactions (TransactionController).
 * One function per backend endpoint — nothing more, nothing invented.
 */
export const transactionApi = {
  /** POST /api/v1/transactions — body: CreateTransactionRequest → TransactionResponse (201). */
  create: (payload) => http.post('/v1/transactions', payload),

  /** GET /api/v1/transactions → TransactionResponse[]. */
  list: () => http.get('/v1/transactions'),

  /** GET /api/v1/transactions/{transactionCode} → TransactionResponse. */
  getByCode: (transactionCode) => http.get(`/v1/transactions/${transactionCode}`),
};
