import { beforeEach, describe, expect, it } from 'vitest';
import {
  cancelCreditNote,
  createCreditNote,
  creditableAmount,
  creditTotalsByDebitNote,
  creditTotalsByLine,
  getCreditNotes,
  resetCreditNotesForTests,
} from './creditNoteRepository.js';
import { cancelDebitNote, getDebitNoteById, resetDebitNotesForTests } from '../../debit-notes/data/debitNoteRepository.js';
import { getOutflowRowById } from '../../outflow-budget/data/outflowRepository.js';

// BL-11-03: paid 3,20,000 + DN-2026-002 18,500. The seed CN-2026-001 isn't tied to a line.
const input = {
  outflowLineId: 'BL-11-03',
  date: '2026-07-02',
  amount: '1500',
  reason: 'REFUND',
  book: 'LC',
  payeeCategory: 'VENDOR',
  payee: { id: 'PAYEE-004', name: 'Greenleaf Agro Logistics' },
  paymentMode: { id: 1, name: 'NEFT' },
  reference: ' ref ',
};

describe('creditNoteRepository', () => {
  beforeEach(() => {
    resetCreditNotesForTests();
    resetDebitNotesForTests();
  });

  it('creates an issued note with the next id for its year', () => {
    const note = createCreditNote(input, { by: 'Tester' });
    expect(note.id).toBe('CN-2026-002');
    expect(note.amount).toBe(1500);
    expect(note.reference).toBe('ref');
    expect(note.debitNoteId).toBeNull();
    expect(note.status).toBe('ISSUED');
    expect(getCreditNotes()[0]).toBe(note);
  });

  it('requires amount and receipt mode; line, party and reason are optional', () => {
    expect(createCreditNote({ ...input, payeeCategory: '', payee: null }).payee).toBeNull();
    // Without a line there's no Spent to cap against, and no line total is touched.
    const unlinked = createCreditNote({ ...input, outflowLineId: '', amount: 999999 });
    expect(unlinked.outflowLineId).toBeNull();
    expect(creditTotalsByLine()['BL-11-03']).toBe(1500);
    expect(() => createCreditNote({ ...input, outflowLineId: 'BL-NOPE' })).toThrow(/not found/);
    expect(() => createCreditNote({ ...input, amount: '0' })).toThrow(/greater than zero/);
    expect(createCreditNote({ ...input, reason: '' }).reason).toBeNull();
    expect(() => createCreditNote({ ...input, paymentMode: null })).toThrow(/received/);
    expect(() => createCreditNote({ ...input, fundProfile: { id: 1, name: 'F' } })).toThrow(/needs its donor/);
    // Disbursement type is only kept alongside a fund profile.
    expect(createCreditNote({ ...input, disbursementType: 'Tranches' }).disbursementType).toBeNull();
    const fund = { donor: { id: 7, name: 'D' }, fundProfile: { id: 3, name: 'F' }, disbursementType: 'Tranches' };
    const tranched = createCreditNote({ ...input, ...fund, tranche: { id: 11, name: 'Tranche 1 — ₹5,00,000' } });
    expect(tranched.disbursementType).toBe('Tranches');
    expect(tranched.tranche.id).toBe(11);
    expect(createCreditNote({ ...input, tranche: { id: 11, name: 'T1' } }).tranche).toBeNull();
  });

  it('caps a line credit at what has been spent on the line', () => {
    const line = getOutflowRowById('BL-11-03');
    expect(creditableAmount({ line })).toBe(320000 + 18500);
    expect(() => createCreditNote({ ...input, amount: 338501 })).toThrow(/Only ₹3,38,500 has been spent/);
    // An unpaid line with no debit notes has nothing to credit.
    expect(creditableAmount({ line: getOutflowRowById('BL-01-04') })).toBe(0);
  });

  it('caps a debit-note credit at what is left of that note, and checks it belongs to the line', () => {
    const line = getOutflowRowById('BL-11-03');
    expect(creditableAmount({ line, debitNote: getDebitNoteById('DN-2026-002') })).toBe(18500);
    expect(() => createCreditNote({ ...input, debitNoteId: 'DN-2026-002', amount: 18501 })).toThrow(/Only ₹18,500 of DN-2026-002/);
    expect(() => createCreditNote({ ...input, debitNoteId: 'DN-2026-001' })).toThrow(/is on BL-04-02/);
    const note = createCreditNote({ ...input, debitNoteId: 'DN-2026-002', amount: 18500 });
    expect(creditTotalsByDebitNote()).toEqual({ 'DN-2026-002': 18500 });
    expect(note.debitNoteId).toBe('DN-2026-002');
  });

  it('refuses to credit a cancelled debit note', () => {
    cancelDebitNote('DN-2026-002');
    expect(() => createCreditNote({ ...input, debitNoteId: 'DN-2026-002' })).toThrow(/cancelled/);
  });

  it('totals issued notes per line and drops cancelled ones', () => {
    const first = createCreditNote(input);
    createCreditNote({ ...input, amount: 500, debitNoteId: 'DN-2026-002' });
    expect(creditTotalsByLine()).toEqual({ 'BL-11-03': 2000 });
    expect(creditTotalsByDebitNote()).toEqual({ 'DN-2026-002': 500 });
    cancelCreditNote(first.id);
    expect(creditTotalsByLine()).toEqual({ 'BL-11-03': 500 });
    expect(() => cancelCreditNote(first.id)).toThrow(/already cancelled/);
    // The seed note isn't on a line, so cancelling it changes no line total.
    cancelCreditNote('CN-2026-001');
    expect(creditTotalsByLine()).toEqual({ 'BL-11-03': 500 });
  });
});
