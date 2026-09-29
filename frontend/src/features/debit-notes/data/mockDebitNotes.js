/**
 * Seed debit notes. A debit note is an extra amount paid out against an
 * outflow budget line, on top of its recorded payment — it adds to Spent.
 * Master-data picks are { id, name } snapshots (ids are null here because the
 * seed isn't tied to real master records). Stands in for a real API until
 * one ships (BACKEND_GAPS #7).
 */
export const MOCK_DEBIT_NOTES = [
  {
    id: 'DN-2026-001',
    outflowLineId: 'BL-04-02',
    date: '2026-05-14',
    amount: 13654,
    reason: 'FX_DIFFERENCE',
    book: 'FC',
    payeeCategory: 'VENDOR',
    payee: { id: 'PAYEE-003', name: 'Apex Solar Technologies Pvt Ltd' },
    paymentMode: { id: null, name: 'NEFT' },
    bankAccount: { id: null, name: 'State Bank of India — ****1204' },
    group: { id: null, name: 'Programme Expenses' },
    ledger: { id: null, name: 'Equipment' },
    donor: { id: null, name: 'Bluewave Sponsors' },
    fundProfile: { id: null, name: 'DUST monitoring equipment grant' },
    grant: { id: null, name: 'GA-2026-014' },
    reference: 'SBI remittance advice 0510-1204',
    remarks: 'Remitted at 91.6 against a budgeted 91.4.',
    attachment: null,
    status: 'ISSUED',
    createdBy: 'Programme Finance',
    createdAt: '2026-05-14T11:20:00',
  },
  {
    id: 'DN-2026-002',
    outflowLineId: 'BL-11-03',
    date: '2026-06-08',
    amount: 18500,
    reason: 'ADDITIONAL_CHARGE',
    book: 'LC',
    payeeCategory: 'VENDOR',
    payee: { id: 'PAYEE-004', name: 'Greenleaf Agro Logistics' },
    paymentMode: { id: null, name: 'Cheque' },
    bankAccount: { id: null, name: 'ICICI Bank — ****0019' },
    group: { id: null, name: 'Administrative Expenses' },
    ledger: { id: null, name: 'Rent & Utilities' },
    donor: null, // unrestricted line — not charged to a donor fund
    fundProfile: null,
    grant: null,
    reference: 'Landlord bill EB/JUN/26',
    remarks: 'Electricity overage for June.',
    attachment: null,
    status: 'ISSUED',
    createdBy: 'Admin',
    createdAt: '2026-06-08T15:02:00',
  },
];
