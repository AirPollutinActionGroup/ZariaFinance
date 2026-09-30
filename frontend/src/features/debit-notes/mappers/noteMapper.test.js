import { describe, expect, it } from 'vitest';
import { fromNoteResponse, toCreateNoteRequest } from './noteMapper.js';

describe('noteMapper', () => {
  it('maps a response to the view model', () => {
    const vm = fromNoteResponse({
      id: 'DN-2026-004',
      recordId: 12,
      outflowLineId: 'BUD-2026-001-BL01-Q2',
      line: 'Salaries',
      date: '2026-07-10',
      amount: 1250.5,
      book: 'LC',
      payee: { id: 'PAYEE-003', name: 'Apex Solar' },
      attachmentName: 'bill.pdf',
    });
    expect(vm).toMatchObject({
      id: 'DN-2026-004',
      outflowLineId: 'BUD-2026-001-BL01-Q2',
      lineDescription: 'Salaries',
      amount: 1250.5,
      payee: { id: 'PAYEE-003', name: 'Apex Solar' },
      attachment: { name: 'bill.pdf' },
      donor: null,
      reference: '',
    });
  });

  it('builds a create request with string ids and blanks dropped', () => {
    const req = toCreateNoteRequest(
      {
        outflowLineId: 'BUD-2026-001-BL01-Q2',
        date: '2026-07-10',
        amount: '400',
        book: 'LC',
        payeeCategory: 'VENDOR',
        payee: { id: 'PAYEE-003', name: 'Apex Solar' },
        paymentMode: { id: 5, name: 'NEFT' },
        bankAccount: null,
        group: { id: 2, name: 'Programme Expenses' },
        donor: { id: 7, name: '' }, // no name → not picked
        reference: '  ',
        attachment: { name: 'bill.pdf', url: 'blob:x' },
      },
      { actor: 'Asha' },
    );
    expect(req).toMatchObject({
      amount: 400,
      paymentMode: { id: '5', name: 'NEFT' },
      group: { id: '2', name: 'Programme Expenses' },
      bankAccount: null,
      donor: null,
      reference: null,
      attachmentName: 'bill.pdf',
      actor: 'Asha',
    });
  });
});
