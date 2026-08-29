import { MOCK_INFLOW_ROWS } from './mockInflowBudget.js';

/**
 * In-memory mock store. A module-level singleton so the list and detail
 * pages (independently-mounted routes) see the same data — recording a
 * receipt on one page is reflected when the other is next mounted. Stands
 * in for a real repository until the Budget API ships (BACKEND_GAPS #7).
 */
let rows = MOCK_INFLOW_ROWS.map((row) => ({ ...row }));

export function getInflowRows() {
  return rows;
}

export function getInflowRowById(id) {
  return rows.find((row) => row.id === id) || null;
}

export function recordInflowReceipt(id, patch) {
  rows = rows.map((row) => (row.id === id ? { ...row, ...patch } : row));
  return rows;
}
