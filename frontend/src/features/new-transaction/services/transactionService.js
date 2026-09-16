import { transactionApi } from '../api/transactionApi.js';
import { fromTransactionResponse, toCreateTransactionRequest } from '../mappers/transactionMapper.js';

/**
 * Transaction domain service. All business behaviour lives here; hooks and
 * components call the service, never the repository directly.
 */
export const transactionService = {
  async listTransactions() {
    const dtos = await transactionApi.list();
    return dtos.map(fromTransactionResponse);
  },

  async getTransaction(transactionCode) {
    return fromTransactionResponse(await transactionApi.getByCode(transactionCode));
  },

  async createTransaction(formValues) {
    return fromTransactionResponse(await transactionApi.create(toCreateTransactionRequest(formValues)));
  },
};
