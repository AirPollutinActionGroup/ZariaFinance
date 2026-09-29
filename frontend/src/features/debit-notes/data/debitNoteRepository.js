import { MOCK_DEBIT_NOTES } from './mockDebitNotes.js';

/**
 * In-memory mock store — a module-level singleton so the Debit Notes page and
 * the Outflow Budget pages see the same notes within a session (lost on
 * reload). Stands in for a real repository until the API ships.
 */
let notes = structuredClone(MOCK_DEBIT_NOTES);

const nowIso = () => new Date().toISOString().slice(0, 19);

function nextId(date) {
  const prefix = `DN-${(date || '').slice(0, 4) || new Date().getFullYear()}-`;
  const max = notes
    .filter((n) => n.id.startsWith(prefix))
    .reduce((m, n) => Math.max(m, Number(n.id.slice(prefix.length)) || 0), 0);
  return `${prefix}${String(max + 1).padStart(3, '0')}`;
}

export function getDebitNotes() {
  return notes;
}

export function getDebitNoteById(id) {
  return notes.find((n) => n.id === id) || null;
}

/**
 * Master-data picks (payee, payment mode, bank account, group, ledger) are
 * stored as { id, name } snapshots so the note still reads correctly if the
 * master record is later renamed or deactivated.
 */
export function createDebitNote(input, { by } = {}) {
  const amount = Number(input.amount);
  if (!input.outflowLineId) throw new Error('Select the outflow line this debit note is for');
  if (!input.date) throw new Error('Debit note date is required');
  if (!(amount > 0)) throw new Error('Amount must be greater than zero');
  if (!input.book) throw new Error('Select a book');
  if (!input.payeeCategory || !input.payee?.id) throw new Error('Select the payee');
  if (!input.paymentMode?.id) throw new Error('Select a payment mode');
  if (!input.group?.id) throw new Error('Select a payment group');
  if (input.fundProfile && !input.donor) throw new Error('A fund profile needs its donor');

  const note = {
    id: nextId(input.date),
    outflowLineId: input.outflowLineId,
    date: input.date,
    amount,
    // Only asked for (and required by the form) when the note takes its line over budget.
    reason: input.reason || null,
    book: input.book,
    payeeCategory: input.payeeCategory,
    payee: input.payee,
    paymentMode: input.paymentMode,
    bankAccount: input.bankAccount || null,
    group: input.group,
    ledger: input.ledger || null,
    // Fund & Grant — which donor fund the payment is charged to (required by
    // the form for restricted lines; optional for unrestricted / corpus).
    donor: input.donor || null,
    fundProfile: input.fundProfile || null,
    grant: input.grant || null,
    reference: (input.reference || '').trim(),
    remarks: (input.remarks || '').trim(),
    attachment: input.attachment || null,
    status: 'ISSUED',
    createdBy: by,
    createdAt: nowIso(),
  };
  notes = [note, ...notes];
  return note;
}

/** Cancelled notes stay on record but no longer count towards Spent. */
export function cancelDebitNote(id, { by, note = '' } = {}) {
  const existing = notes.find((n) => n.id === id);
  if (!existing) throw new Error(`Debit note ${id} not found`);
  if (existing.status === 'CANCELLED') throw new Error(`${id} is already cancelled`);
  const updated = { ...existing, status: 'CANCELLED', cancelledBy: by, cancelledAt: nowIso(), cancelNote: note };
  notes = notes.map((n) => (n.id === id ? updated : n));
  return updated;
}

/** { [outflowLineId]: total of issued (non-cancelled) debit notes }. */
export function debitTotalsByLine(list = notes) {
  const totals = {};
  for (const n of list) {
    if (n.status !== 'ISSUED') continue;
    totals[n.outflowLineId] = (totals[n.outflowLineId] || 0) + n.amount;
  }
  return totals;
}

/** Test seam — production code must not call this. */
export function resetDebitNotesForTests() {
  notes = structuredClone(MOCK_DEBIT_NOTES);
}
