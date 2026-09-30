import { describe, expect, it } from 'vitest';
import { fromBudgetResponse, toSaveBudgetRequest } from './budgetMapper.js';

const detail = {
  id: 7,
  budgetCode: 'BUD-2026-003',
  name: 'Clean Air',
  financialYear: '2026-27',
  financialYearId: 3,
  financialYearCode: 'FY 2026-27',
  budgetType: 'PROGRAMME',
  programmeId: 6,
  programmeName: 'Clean Air Action Programme',
  scope: 'Clean Air Action Programme',
  stateId: 9,
  stateName: 'Delhi',
  status: 'DRAFT',
  total: 1700.5,
  lineCount: 1,
  lines: [
    { id: 31, lineCode: 'BL-01', categoryId: 1, categoryName: 'Personnel', categoryActive: true, description: 'Salaries', book: 'LC', q1: 1000, q2: 700.5, q3: 0, q4: 0, total: 1700.5 },
  ],
  history: [{ status: 'DRAFT', at: '2026-09-29T10:00:00', by: 'Tester', note: 'Created' }],
};

describe('budgetMapper', () => {
  it('maps a detail response to the view model', () => {
    const vm = fromBudgetResponse(detail);
    expect(vm).toMatchObject({
      id: 7,
      budgetCode: 'BUD-2026-003',
      financialYearId: 3,
      financialYearCode: 'FY 2026-27',
      programme: 'Clean Air Action Programme',
      programmeId: 6,
      stateName: 'Delhi',
      notes: '',
      total: 1700.5,
      lineCount: 1,
    });
    expect(vm.lines[0]).toEqual({
      id: 31, lineCode: 'BL-01', category: 1, categoryName: 'Personnel', categoryActive: true,
      description: 'Salaries', book: 'LC', q1: 1000, q2: 700.5, q3: 0, q4: 0,
    });
    expect(vm.history).toHaveLength(1);
  });

  it('maps a list row (no lines) and an organisation budget', () => {
    const vm = fromBudgetResponse({ id: 2, budgetType: 'ORGANISATION', scope: 'Organisation-wide', total: '500', lineCount: 3 });
    expect(vm).toMatchObject({ programme: 'Organisation-wide', programmeId: null, stateName: '', total: 500, lineCount: 3, lines: [] });
  });

  it('builds a save request, coercing blanks and dropping the programme for organisation budgets', () => {
    const draft = {
      name: ' Overheads ',
      financialYear: '2026-27',
      financialYearId: 3,
      budgetType: 'ORGANISATION',
      programmeId: 6,
      stateId: null,
      owner: ' ',
      notes: 'x',
      lines: [{ id: 'new-1', category: '4', description: ' Travel ', book: 'LC', q1: '120', q2: '', q3: null, q4: 5 }],
    };
    expect(toSaveBudgetRequest(draft, { submit: true, actor: 'Asha' })).toEqual({
      name: 'Overheads',
      financialYearId: 3,
      budgetType: 'ORGANISATION',
      programmeId: null,
      stateId: null,
      owner: null,
      notes: 'x',
      lines: [{ categoryId: 4, description: 'Travel', book: 'LC', q1: 120, q2: 0, q3: 0, q4: 5 }],
      submit: true,
      actor: 'Asha',
    });
  });

  it('only sends a real programme id (not a name-only seed option)', () => {
    const base = { name: 'P', financialYear: '2026-27', budgetType: 'PROGRAMME', lines: [] };
    expect(toSaveBudgetRequest({ ...base, programmeId: 6 }).programmeId).toBe(6);
    expect(toSaveBudgetRequest({ ...base, programmeId: 'name:Old' }).programmeId).toBeNull();
  });
});
