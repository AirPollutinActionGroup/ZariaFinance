import { beforeEach, describe, expect, it } from 'vitest';
import {
  cancelDebitNote,
  createDebitNote,
  debitTotalsByLine,
  getDebitNotes,
  resetDebitNotesForTests,
} from './debitNoteRepository.js';

const input = {
  outflowLineId: 'BL-11-03',
  date: '2026-07-02',
  amount: '1500',
  reason: 'OTHER',
  book: 'LC',
  payeeCategory: 'VENDOR',
  payee: { id: 'PAYEE-004', name: 'Greenleaf Agro Logistics' },
  paymentMode: { id: 1, name: 'NEFT' },
  group: { id: 2, name: 'Administrative Expenses' },
  reference: ' ref ',
};

describe('debitNoteRepository', () => {
  beforeEach(() => resetDebitNotesForTests());

  it('creates an issued note with the next id for its year', () => {
    const note = createDebitNote(input, { by: 'Tester' });
    expect(note.id).toBe('DN-2026-003');
    expect(note.amount).toBe(1500);
    expect(note.reference).toBe('ref');
    expect(note.status).toBe('ISSUED');
    expect(getDebitNotes()[0]).toBe(note);
  });

  it('rejects missing line and zero amount; reason is optional', () => {
    expect(() => createDebitNote({ ...input, outflowLineId: '' })).toThrow(/outflow line/);
    expect(() => createDebitNote({ ...input, amount: '0' })).toThrow(/greater than zero/);
    expect(createDebitNote({ ...input, reason: '' }).reason).toBeNull();
  });

  it('requires book, payee, payment mode and group; bank account, ledger and attachment are optional', () => {
    expect(() => createDebitNote({ ...input, book: '' })).toThrow(/book/);
    expect(() => createDebitNote({ ...input, payee: null })).toThrow(/payee/);
    expect(() => createDebitNote({ ...input, paymentMode: null })).toThrow(/payment mode/);
    expect(() => createDebitNote({ ...input, group: null })).toThrow(/payment group/);
    const note = createDebitNote(input);
    expect(note.bankAccount).toBeNull();
    expect(note.ledger).toBeNull();
    expect(note.attachment).toBeNull();
    expect(note.payee.name).toBe('Greenleaf Agro Logistics');
    expect(note.donor).toBeNull();
  });

  it('stores Fund & Grant and refuses a fund profile without its donor', () => {
    const fund = { donor: { id: 7, name: 'Greenline CSR' }, fundProfile: { id: 3, name: 'Air quality fund' }, grant: { id: 9, name: 'GA-01' } };
    const note = createDebitNote({ ...input, ...fund });
    expect(note.fundProfile.name).toBe('Air quality fund');
    expect(note.grant.name).toBe('GA-01');
    expect(() => createDebitNote({ ...input, fundProfile: fund.fundProfile })).toThrow(/needs its donor/);
  });

  it('totals issued notes per line and drops cancelled ones', () => {
    createDebitNote(input);
    expect(debitTotalsByLine()).toEqual({ 'BL-04-02': 13654, 'BL-11-03': 20000 });
    cancelDebitNote('DN-2026-002');
    expect(debitTotalsByLine()).toEqual({ 'BL-04-02': 13654, 'BL-11-03': 1500 });
    expect(() => cancelDebitNote('DN-2026-002')).toThrow(/already cancelled/);
  });
});
