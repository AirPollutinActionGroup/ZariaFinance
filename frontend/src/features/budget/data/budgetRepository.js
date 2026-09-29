import { MOCK_BUDGETS } from './mockBudgets.js';

/**
 * In-memory mock store — a module-level singleton so list, form and detail
 * routes see the same data within a session (lost on page reload). Stands in
 * for a real repository until the Budget API ships (BACKEND_GAPS #7).
 */
let budgets = structuredClone(MOCK_BUDGETS);

/** Allowed status transitions. Editing a Rejected budget puts it back to Draft (see updateBudget). */
const TRANSITIONS = Object.freeze({
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['APPROVED', 'REJECTED', 'DRAFT'],
  APPROVED: [],
  REJECTED: ['DRAFT'],
});

export const EDITABLE_STATUSES = Object.freeze(['DRAFT', 'REJECTED']);

const nowIso = () => new Date().toISOString().slice(0, 19);

function nextBudgetId(financialYear) {
  const year = (financialYear || '').slice(0, 4) || String(new Date().getFullYear());
  const prefix = `BUD-${year}-`;
  const max = budgets
    .filter((b) => b.id.startsWith(prefix))
    .reduce((m, b) => Math.max(m, Number(b.id.slice(prefix.length)) || 0), 0);
  return `${prefix}${String(max + 1).padStart(3, '0')}`;
}

/** Renumbers lines BL-01, BL-02… in their current order. */
function normaliseLines(lines) {
  return lines.map((line, i) => ({ ...line, id: `BL-${String(i + 1).padStart(2, '0')}` }));
}

export function canTransition(from, to) {
  return (TRANSITIONS[from] || []).includes(to);
}

export function getBudgets() {
  return budgets;
}

export function getBudgetById(id) {
  return budgets.find((b) => b.id === id) || null;
}

export function createBudget(draft, { by, submit = false } = {}) {
  const at = nowIso();
  const budget = {
    ...draft,
    id: nextBudgetId(draft.financialYear),
    lines: normaliseLines(draft.lines),
    status: submit ? 'SUBMITTED' : 'DRAFT',
    createdAt: at,
    updatedAt: at,
    history: [
      { status: 'DRAFT', at, by, note: 'Created' },
      ...(submit ? [{ status: 'SUBMITTED', at, by, note: '' }] : []),
    ],
  };
  budgets = [budget, ...budgets];
  return budget;
}

export function updateBudget(id, draft, { by, submit = false } = {}) {
  const existing = getBudgetById(id);
  if (!existing) throw new Error(`Budget ${id} not found`);
  if (!EDITABLE_STATUSES.includes(existing.status)) {
    throw new Error(`A ${existing.status.toLowerCase()} budget cannot be edited`);
  }
  const at = nowIso();
  const history = [...existing.history];
  if (existing.status === 'REJECTED') history.push({ status: 'DRAFT', at, by, note: 'Revised after rejection' });
  if (submit) history.push({ status: 'SUBMITTED', at, by, note: '' });

  const updated = {
    ...existing,
    ...draft,
    id,
    lines: normaliseLines(draft.lines),
    status: submit ? 'SUBMITTED' : 'DRAFT',
    updatedAt: at,
    history,
  };
  budgets = budgets.map((b) => (b.id === id ? updated : b));
  return updated;
}

export function transitionBudget(id, to, { by, note = '' } = {}) {
  const existing = getBudgetById(id);
  if (!existing) throw new Error(`Budget ${id} not found`);
  if (!canTransition(existing.status, to)) {
    throw new Error(`Cannot move a budget from ${existing.status} to ${to}`);
  }
  const at = nowIso();
  const updated = { ...existing, status: to, updatedAt: at, history: [...existing.history, { status: to, at, by, note }] };
  budgets = budgets.map((b) => (b.id === id ? updated : b));
  return updated;
}

export function deleteBudget(id) {
  const existing = getBudgetById(id);
  if (existing && existing.status !== 'DRAFT') throw new Error('Only draft budgets can be deleted');
  budgets = budgets.filter((b) => b.id !== id);
}

/** Test seam — production code must not call this. */
export function resetBudgetsForTests() {
  budgets = structuredClone(MOCK_BUDGETS);
}
