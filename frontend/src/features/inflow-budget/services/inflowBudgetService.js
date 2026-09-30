import { inflowBudgetApi } from '../api/inflowBudgetApi.js';

/**
 * Inflow Budget domain service. All business behaviour lives here; hooks and
 * components call the service, never the repository directly.
 *
 * InflowBudgetLineResponse → view model: only `id` needs mapping (numeric on
 * the wire, string everywhere the page uses it — route params, search, keys).
 * Received money on a line is the credit notes raised against its tranche —
 * the backend adds them up, so there is nothing to record here.
 */
function fromResponse(dto) {
  return { ...dto, id: String(dto.id) };
}

export const inflowBudgetService = {
  async listLines() {
    const dtos = await inflowBudgetApi.list();
    return dtos.map(fromResponse);
  },

  async getLine(id) {
    return fromResponse(await inflowBudgetApi.getById(id));
  },
};
