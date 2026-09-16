import { trancheApi } from '../../donor-management/api/trancheApi.js';
import { fromTrancheResponse, toReceiveTrancheRequest } from '../mappers/inflowMapper.js';

/**
 * Inflow Budget domain service. The schedule is sourced from the real Grant
 * Tranche master (TrancheController) — hooks/components call this service,
 * never the repository directly.
 */
export const inflowService = {
  async listInflowRows() {
    const dtos = await trancheApi.listAll();
    return dtos.map(fromTrancheResponse);
  },

  async getInflowRow(id) {
    return fromTrancheResponse(await trancheApi.getById(id));
  },

  async recordReceipt(id, form) {
    return fromTrancheResponse(await trancheApi.receive(id, toReceiveTrancheRequest(form)));
  },
};
