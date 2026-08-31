import { paymentModeApi } from '../api/paymentModeApi.js';
import { fromPaymentModeResponse, toCreatePaymentModeRequest } from '../mappers/paymentModeMapper.js';

/**
 * Payment Mode domain service. All business behaviour lives here; hooks
 * and components call the service, never the repository directly.
 */
export const paymentModeService = {
  async listPaymentModes(search) {
    const dtos = await paymentModeApi.list(search);
    return dtos.map(fromPaymentModeResponse);
  },

  async createPaymentMode(formValues) {
    return fromPaymentModeResponse(await paymentModeApi.create(toCreatePaymentModeRequest(formValues)));
  },

  async activatePaymentMode(id) {
    await paymentModeApi.activate(id);
  },

  async deactivatePaymentMode(id) {
    await paymentModeApi.deactivate(id);
  },
};
