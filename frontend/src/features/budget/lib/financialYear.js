/** Indian financial year (Apr–Mar) label for a date, e.g. 25 Sep 2026 → "2026-27", 10 Feb 2027 → "2026-27". */
export function financialYearOf(date = new Date()) {
  const start = date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, '0')}`;
}

/**
 * "2026-27" for a Financial Year master row, from its start date ("2026-04-01")
 * — the same rule the backend uses, so labels always match budgets.
 */
export function labelFromStartDate(startDate) {
  const start = Number(String(startDate || '').slice(0, 4));
  if (!start) return '';
  return `${start}-${String((start + 1) % 100).padStart(2, '0')}`;
}

/**
 * Financial Year master rows → options for the Budget pages, oldest first:
 * { id, label: "2026-27", code: "FY 2026-27", status: ACTIVE | UPCOMING | CLOSED }.
 */
export function toFinancialYearOptions(rows = []) {
  return [...rows]
    .sort((a, b) => String(a.startDate).localeCompare(String(b.startDate)))
    .map((fy) => ({ id: fy.id, label: labelFromStartDate(fy.startDate), code: fy.code, status: fy.status }))
    .filter((fy) => fy.label);
}

/** True for a well-formed consecutive-year label like "2026-27" (guards the ?fy= URL param). */
export function isFinancialYearLabel(value) {
  const match = /^(\d{4})-(\d{2})$/.exec(value || '');
  return Boolean(match) && (Number(match[1]) + 1) % 100 === Number(match[2]);
}

/** Previous, current and next FY around `date`, oldest first. */
export function financialYearOptions(date = new Date()) {
  const start = Number(financialYearOf(date).slice(0, 4));
  return [start - 1, start, start + 1].map((y) => financialYearOf(new Date(y, 3, 1)));
}
