import { bankDetailApi } from '../api/bankDetailApi.js';
import { fromBankDetailResponse, toCreateBankDetailRequest } from '../mappers/bankDetailMapper.js';

/**
 * Bank Details domain service. All business behaviour lives here; hooks
 * and components call the service, never the repository directly.
 */
export const bankDetailService = {
  async listBankDetails(search) {
    const dtos = await bankDetailApi.list(search);
    return dtos.map(fromBankDetailResponse);
  },

  async createBankDetail(formValues) {
    return fromBankDetailResponse(await bankDetailApi.create(toCreateBankDetailRequest(formValues)));
  },

  async activateBankDetail(id) {
    await bankDetailApi.activate(id);
  },

  async deactivateBankDetail(id) {
    await bankDetailApi.deactivate(id);
  },
};
