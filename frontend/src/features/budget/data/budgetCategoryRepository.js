/**
 * Budget Category master — the heads a budget line is booked against.
 * Managed on Master Configuration → Budget Category; read by the budget line
 * editor and detail page. In-memory (module singleton, lost on reload) like
 * the rest of the Budget module until its API ships (BACKEND_GAPS #7).
 *
 * `id` is a stable code (e.g. "PERSONNEL") and is what budget lines store,
 * so renaming a category never breaks existing lines.
 */
const SEED = [
  { id: 'PERSONNEL', name: 'Personnel', description: 'Salaries, stipends and staff benefits' },
  { id: 'PROGRAMME', name: 'Programme activities', description: 'Direct activity and implementation costs' },
  { id: 'CONSULTANTS', name: 'Consultants', description: 'Studies, audits and professional services' },
  { id: 'TRAVEL', name: 'Travel', description: 'Field visits, conveyance and lodging' },
  { id: 'EQUIPMENT', name: 'Equipment & assets', description: 'Capital purchases and equipment' },
  { id: 'ADMIN', name: 'Admin & overheads', description: 'Rent, utilities and shared office costs' },
].map((c) => ({ ...c, status: 'ACTIVE' }));

let categories = SEED.map((c) => ({ ...c }));
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());

/** For useSyncExternalStore. */
export function subscribeBudgetCategories(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getBudgetCategories() {
  return categories;
}

export function getBudgetCategoryName(id) {
  return categories.find((c) => c.id === id)?.name || id || '—';
}

const normalise = (name) => name.trim().replace(/\s+/g, ' ');

/** "Office rent & utilities" → "OFFICE_RENT_UTILITIES", made unique. */
function codeFor(name) {
  const base =
    normalise(name)
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'CATEGORY';
  let code = base;
  for (let n = 2; categories.some((c) => c.id === code); n += 1) code = `${base}_${n}`;
  return code;
}

function assertUniqueName(name, exceptId) {
  const clash = categories.find((c) => c.id !== exceptId && c.name.toLowerCase() === name.toLowerCase());
  if (clash) throw new Error(`A category named "${clash.name}" already exists`);
}

export function createBudgetCategory({ name, description = '', status = 'ACTIVE' }) {
  const clean = normalise(name || '');
  if (!clean) throw new Error('Category name is required');
  assertUniqueName(clean);
  const category = { id: codeFor(clean), name: clean, description: description.trim(), status };
  categories = [...categories, category];
  notify();
  return category;
}

export function updateBudgetCategory(id, { name, description = '' }) {
  const clean = normalise(name || '');
  if (!clean) throw new Error('Category name is required');
  assertUniqueName(clean, id);
  categories = categories.map((c) => (c.id === id ? { ...c, name: clean, description: description.trim() } : c));
  notify();
  return categories.find((c) => c.id === id);
}

/** Inactive categories stay on existing lines but can't be picked for new ones. */
export function setBudgetCategoryStatus(id, status) {
  categories = categories.map((c) => (c.id === id ? { ...c, status } : c));
  notify();
}

/** Test seam — production code must not call this. */
export function resetBudgetCategoriesForTests() {
  categories = SEED.map((c) => ({ ...c }));
  notify();
}
