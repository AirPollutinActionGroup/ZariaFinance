import { paymentTypeLedgerApi } from '../api/paymentTypeLedgerApi.js';
import { fromPaymentTypeLedgerResponse, toCreatePaymentTypeLedgerRequest } from '../mappers/paymentTypeLedgerMapper.js';

/**
 * Payment Type Ledger domain service. All business behaviour lives here;
 * hooks and components call the service, never the repository directly.
 */
export const paymentTypeLedgerService = {
  async listLedgers(search) {
    const dtos = await paymentTypeLedgerApi.list(search);
    return dtos.map(fromPaymentTypeLedgerResponse);
  },

  async createLedger(formValues) {
    return fromPaymentTypeLedgerResponse(
      await paymentTypeLedgerApi.create(toCreatePaymentTypeLedgerRequest(formValues)),
    );
  },

  async activateLedger(id) {
    await paymentTypeLedgerApi.activate(id);
  },

  async deactivateLedger(id) {
    await paymentTypeLedgerApi.deactivate(id);
  },
};
