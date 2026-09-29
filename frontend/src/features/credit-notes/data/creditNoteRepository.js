import { MOCK_CREDIT_NOTES } from './mockCreditNotes.js';
import { debitTotalsByLine, getDebitNoteById, getDebitNotes } from '../../debit-notes/data/debitNoteRepository.js';
import { getOutflowRowById } from '../../outflow-budget/data/outflowRepository.js';
import { rowSpent } from '../../outflow-budget/lib/spent.js';

/**
 * In-memory mock store, shared across pages within a session (lost on
 * reload) — same model as the debit-note repository.
 */
let notes = structuredClone(MOCK_CREDIT_NOTES);

const nowIso = () => new Date().toISOString().slice(0, 19);

function nextId(date) {
  const prefix = `CN-${(date || '').slice(0, 4) || new Date().getFullYear()}-`;
  const max = notes
    .filter((n) => n.id.startsWith(prefix))
    .reduce((m, n) => Math.max(m, Number(n.id.slice(prefix.length)) || 0), 0);
  return `${prefix}${String(max + 1).padStart(3, '0')}`;
}

export function getCreditNotes() {
  return notes;
}

export function getCreditNoteById(id) {
  return notes.find((n) => n.id === id) || null;
}

/** { [outflowLineId]: total of issued credit notes }. */
export function creditTotalsByLine(list = notes) {
  const totals = {};
  for (const n of list) {
    if (n.status !== 'ISSUED' || !n.outflowLineId) continue;
    totals[n.outflowLineId] = (totals[n.outflowLineId] || 0) + n.amount;
  }
  return totals;
}

/** { [debitNoteId]: total of issued credit notes reversing it }. */
export function creditTotalsByDebitNote(list = notes) {
  const totals = {};
  for (const n of list) {
    if (n.status !== 'ISSUED' || !n.debitNoteId) continue;
    totals[n.debitNoteId] = (totals[n.debitNoteId] || 0) + n.amount;
  }
  return totals;
}

/**
 * Most a new credit note may be for: a line can't be credited below zero
 * spent, and a debit note can't be credited back more than its own amount.
 */
export function creditableAmount({ line, debitNote = null, debitNotes = getDebitNotes(), creditNotes = notes }) {
  if (!line) return 0;
  const lineSpent = rowSpent(line, debitTotalsByLine(debitNotes), creditTotalsByLine(creditNotes));
  if (!debitNote) return Math.max(0, lineSpent);
  const outstanding = debitNote.amount - (creditTotalsByDebitNote(creditNotes)[debitNote.id] || 0);
  return Math.max(0, Math.min(lineSpent, outstanding));
}

export function createCreditNote(input, { by } = {}) {
  const amount = Number(input.amount);
  // The outflow line is optional; when given, the note is taken off that line's Spent.
  const line = input.outflowLineId ? getOutflowRowById(input.outflowLineId) : null;
  if (input.outflowLineId && !line) throw new Error(`Outflow line ${input.outflowLineId} not found`);
  if (!input.date) throw new Error('Credit note date is required');
  if (!(amount > 0)) throw new Error('Amount must be greater than zero');
  if (!input.book) throw new Error('Select a book');
  if (!input.paymentMode?.id) throw new Error('Select how the money was received');
  if (input.fundProfile && !input.donor) throw new Error('A fund profile needs its donor');

  let debitNote = null;
  if (input.debitNoteId) {
    debitNote = getDebitNoteById(input.debitNoteId);
    if (!debitNote) throw new Error(`Debit note ${input.debitNoteId} not found`);
    if (debitNote.status !== 'ISSUED') throw new Error(`${debitNote.id} is cancelled and can't be credited`);
    if (!line || debitNote.outflowLineId !== line.id) {
      throw new Error(`${debitNote.id} is on ${debitNote.outflowLineId}, not ${line?.id || 'this note'}`);
    }
  }

  const max = line ? creditableAmount({ line, debitNote }) : Infinity;
  if (amount > max) {
    throw new Error(
      debitNote
        ? `Only ₹${max.toLocaleString('en-IN')} of ${debitNote.id} is left to credit`
        : `Only ₹${max.toLocaleString('en-IN')} has been spent on ${line.id}`,
    );
  }

  const note = {
    id: nextId(input.date),
    outflowLineId: line?.id || null,
    debitNoteId: debitNote?.id || null,
    date: input.date,
    amount,
    reason: input.reason || null, // no longer asked for on the form; older notes may carry one
    book: input.book,
    // Party is only known when reversing a debit note (copied from it).
    payeeCategory: input.payeeCategory || null,
    payee: input.payee || null,
    paymentMode: input.paymentMode,
    bankAccount: input.bankAccount || null,
    group: input.group || null,
    ledger: input.ledger || null,
    donor: input.donor || null,
    fundProfile: input.fundProfile || null,
    grant: input.grant || null,
    // 'Lump Sum' | 'Tranches' — snapshot of the fund profile's rule at the time.
    disbursementType: input.fundProfile ? input.disbursementType || null : null,
    // { id, name } of the tranche, for a fund disbursed in tranches.
    tranche: input.fundProfile ? input.tranche || null : null,
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

/** Cancelled notes stay on record but no longer reduce Spent. */
export function cancelCreditNote(id, { by, note = '' } = {}) {
  const existing = notes.find((n) => n.id === id);
  if (!existing) throw new Error(`Credit note ${id} not found`);
  if (existing.status === 'CANCELLED') throw new Error(`${id} is already cancelled`);
  const updated = { ...existing, status: 'CANCELLED', cancelledBy: by, cancelledAt: nowIso(), cancelNote: note };
  notes = notes.map((n) => (n.id === id ? updated : n));
  return updated;
}

/** Test seam — production code must not call this. */
export function resetCreditNotesForTests() {
  notes = structuredClone(MOCK_CREDIT_NOTES);
}
