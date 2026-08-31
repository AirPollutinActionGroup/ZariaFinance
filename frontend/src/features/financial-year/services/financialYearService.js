import { financialYearApi } from '../api/financialYearApi.js';
import { fromFinancialYearResponse, toCreateFinancialYearRequest } from '../mappers/financialYearMapper.js';

/**
 * Financial Year domain service. All business behaviour lives here; hooks
 * and components call the service, never the repository directly.
 */
export const financialYearService = {
  async listFinancialYears() {
    const dtos = await financialYearApi.list();
    return dtos.map(fromFinancialYearResponse);
  },

  async createFinancialYear(formValues) {
    return fromFinancialYearResponse(await financialYearApi.create(toCreateFinancialYearRequest(formValues)));
  },

  async setCurrentFinancialYear(id) {
    await financialYearApi.setCurrent(id);
  },
};
