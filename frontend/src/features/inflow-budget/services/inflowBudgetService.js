import { inflowBudgetApi } from '../api/inflowBudgetApi.js';

/**
 * Inflow Budget domain service. All business behaviour lives here; hooks and
 * components call the service, never the repository directly.
 *
 * InflowBudgetLineResponse → view model: only `id` needs mapping (numeric on
 * the wire, string everywhere the page uses it — route params, search, keys).
 * Grants report in INR at par, so there is no FX on the backend; any FX the
 * receipt form collects for a foreign-book (FC) line is a display-only carry
 * over from the budgeted expectation and is not sent to the API.
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

  async recordReceipt(id, patch) {
    return fromResponse(
      await inflowBudgetApi.recordReceipt(id, {
        actualDate: patch.actualDate,
        actualAmount: Number(patch.actualAmount),
        receiptRef: patch.receiptRef?.trim() || null,
        receiptNo: patch.receiptNo?.trim() || null,
        varianceReason: patch.varianceReason?.trim() || null,
      }),
    );
  },
};
