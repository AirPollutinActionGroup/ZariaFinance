import { MOCK_OUTFLOW_ROWS } from './mockOutflowBudget.js';

/**
 * In-memory mock store. A module-level singleton so the list and detail
 * pages (independently-mounted routes) see the same data — recording a
 * payment on one page is reflected when the other is next mounted. Stands
 * in for a real repository until the Budget API ships (BACKEND_GAPS #7).
 */
let rows = MOCK_OUTFLOW_ROWS.map((row) => ({ ...row }));

export function getOutflowRows() {
  return rows;
}

export function getOutflowRowById(id) {
  return rows.find((row) => row.id === id) || null;
}

export function recordOutflowPayment(id, patch) {
  rows = rows.map((row) => (row.id === id ? { ...row, ...patch } : row));
  return rows;
}
