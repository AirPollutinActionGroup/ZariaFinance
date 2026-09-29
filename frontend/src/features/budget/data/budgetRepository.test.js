import { beforeEach, describe, expect, it } from 'vitest';
import {
  createBudget,
  deleteBudget,
  getBudgetById,
  getBudgets,
  resetBudgetsForTests,
  transitionBudget,
  updateBudget,
} from './budgetRepository.js';

const draft = {
  name: 'Test budget',
  financialYear: '2026-27',
  budgetType: 'PROGRAMME',
  programme: 'Clean Air',
  owner: 'Tester',
  notes: '',
  lines: [
    { id: 'tmp-a', category: 'PERSONNEL', description: 'A', book: 'LC', q1: 1, q2: 0, q3: 0, q4: 0 },
    { id: 'tmp-b', category: 'TRAVEL', description: 'B', book: 'LC', q1: 2, q2: 0, q3: 0, q4: 0 },
  ],
};

describe('budgetRepository', () => {
  beforeEach(() => resetBudgetsForTests());

  it('creates a draft with the next id for the FY and renumbered lines', () => {
    const created = createBudget(draft, { by: 'Tester' });
    expect(created.id).toBe('BUD-2026-004');
    expect(created.status).toBe('DRAFT');
    expect(created.lines.map((l) => l.id)).toEqual(['BL-01', 'BL-02']);
    expect(getBudgets()[0]).toBe(created);
  });

  it('runs the Draft → Submitted → Rejected → Draft → Approved lifecycle', () => {
    const { id } = createBudget(draft, { by: 'Tester', submit: true });
    expect(getBudgetById(id).status).toBe('SUBMITTED');
    transitionBudget(id, 'REJECTED', { by: 'Controller', note: 'Too high' });
    const revised = updateBudget(id, { ...getBudgetById(id), name: 'Revised' }, { by: 'Tester', submit: true });
    expect(revised.status).toBe('SUBMITTED');
    expect(revised.name).toBe('Revised');
    transitionBudget(id, 'APPROVED', { by: 'Controller' });
    expect(getBudgetById(id).history.map((h) => h.status)).toEqual(['DRAFT', 'SUBMITTED', 'REJECTED', 'DRAFT', 'SUBMITTED', 'APPROVED']);
  });

  it('refuses invalid transitions and edits of approved budgets', () => {
    expect(() => transitionBudget('BUD-2027-001', 'APPROVED')).toThrow();
    expect(() => updateBudget('BUD-2026-001', draft)).toThrow(/cannot be edited/);
    expect(() => deleteBudget('BUD-2026-001')).toThrow();
    deleteBudget('BUD-2027-001');
    expect(getBudgetById('BUD-2027-001')).toBeNull();
  });
});
