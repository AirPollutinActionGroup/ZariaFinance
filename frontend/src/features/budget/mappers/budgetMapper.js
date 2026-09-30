import { QUARTERS } from '../constants.js';

/**
 * BudgetMapper — BudgetResponse ⇄ the view model the Budget pages use.
 *
 * View model: `id` is the numeric record id (routes, API calls) and
 * `budgetCode` the display id (BUD-2026-001). `programme` is the scope label
 * (programme name or "Organisation-wide"); each line's `category` is a
 * Budget Category master id.
 */

const num = (value) => (value == null || value === '' ? 0 : Number(value));

/** BudgetResponse (list row or detail) → view model. */
export function fromBudgetResponse(dto) {
  return {
    id: dto.id,
    budgetCode: dto.budgetCode,
    name: dto.name,
    financialYear: dto.financialYear,
    financialYearId: dto.financialYearId ?? null,
    financialYearCode: dto.financialYearCode || '',
    budgetType: dto.budgetType,
    programmeId: dto.programmeId ?? null,
    programme: dto.scope || dto.programmeName || '',
    stateId: dto.stateId ?? null,
    stateName: dto.stateName || '',
    owner: dto.owner || '',
    notes: dto.notes || '',
    status: dto.status,
    total: num(dto.total),
    lineCount: dto.lineCount ?? dto.lines?.length ?? 0,
    lines: (dto.lines || []).map((line) => ({
      id: line.id,
      lineCode: line.lineCode,
      category: line.categoryId,
      categoryName: line.categoryName,
      categoryActive: line.categoryActive,
      description: line.description,
      book: line.book,
      ...Object.fromEntries(QUARTERS.map((q) => [q.key, num(line[q.key])])),
    })),
    history: dto.history || [],
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

/**
 * Form draft → SaveBudgetRequest. The year goes as its Financial Year master id
 * (`draft.financialYearId`); blank quarters are sent as 0; line ids aren't sent (lines are replaced).
 */
export function toSaveBudgetRequest(draft, { submit = false, actor } = {}) {
  const isProgramme = draft.budgetType === 'PROGRAMME';
  return {
    name: draft.name.trim(),
    financialYearId: draft.financialYearId ?? null,
    budgetType: draft.budgetType,
    programmeId: isProgramme && typeof draft.programmeId === 'number' ? draft.programmeId : null,
    stateId: draft.stateId ?? null,
    owner: draft.owner?.trim() || null,
    notes: draft.notes?.trim() || null,
    lines: draft.lines.map((line) => ({
      categoryId: line.category === '' || line.category == null ? null : Number(line.category),
      description: line.description.trim(),
      book: line.book,
      ...Object.fromEntries(QUARTERS.map((q) => [q.key, num(line[q.key])])),
    })),
    submit,
    actor: actor || null,
  };
}
