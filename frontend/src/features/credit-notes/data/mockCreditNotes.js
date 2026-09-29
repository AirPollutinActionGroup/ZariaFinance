/**
 * Seed credit notes. A credit note records money that came back — a refund,
 * a rebate — optionally returned to a donor fund (and tranche). Master-data
 * picks are { id, name } snapshots; ids are null here because the seed isn't
 * tied to real master records. Stands in for a real API.
 */
export const MOCK_CREDIT_NOTES = [
  {
    id: 'CN-2026-001',
    outflowLineId: null,
    debitNoteId: null,
    date: '2026-06-20',
    amount: 4200,
    reason: null,
    book: 'LC',
    payeeCategory: null,
    payee: null,
    paymentMode: { id: null, name: 'NEFT' },
    bankAccount: { id: null, name: 'ICICI Bank — ****0019' },
    group: { id: null, name: 'Programme Expenses' },
    ledger: { id: null, name: 'Field equipment' },
    donor: { id: null, name: 'Greenline CSR' },
    fundProfile: { id: null, name: 'Air quality monitoring fund' },
    grant: { id: null, name: 'GA-2026-009' },
    disbursementType: 'Tranches',
    tranche: { id: null, name: 'Tranche 1 — ₹6,00,000' },
    reference: 'Vendor credit memo CM/JUN/26',
    remarks: 'Unused field-kit advance returned by the vendor.',
    attachment: null,
    status: 'ISSUED',
    createdBy: 'Admin',
    createdAt: '2026-06-20T10:45:00',
  },
];
