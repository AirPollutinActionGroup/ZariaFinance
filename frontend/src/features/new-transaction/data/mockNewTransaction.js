import { DONOR_TYPE, toOptions } from '../../donor-management/constants.js';
import { ACCOUNT_GROUPS } from '../../transaction-entry/data/transactionData.js';

export { ACCOUNT_GROUPS };

export const TRANSACTION_TYPES = [
  { value: 'DEBIT', label: 'Debit (Out)' },
  { value: 'CREDIT', label: 'Credit (In)' },
];

export const BOOKS = [
  { value: 'LC', label: 'LC · Local contribution' },
  { value: 'FC', label: 'FC · Foreign contribution' },
];

export const PAYEE_CATEGORIES = [
  { value: 'EMPLOYEE', label: 'Employee' },
  { value: 'VENDOR', label: 'Vendor' },
];

export const DONOR_TYPES = toOptions(DONOR_TYPE);

export const PAYEES = [
  { id: 'PAYEE-001', name: 'Aarav Sharma', category: 'EMPLOYEE' },
  { id: 'PAYEE-002', name: 'Priya Narang', category: 'EMPLOYEE' },
  { id: 'PAYEE-003', name: 'Apex Solar Technologies Pvt Ltd', category: 'VENDOR' },
  { id: 'PAYEE-004', name: 'Greenleaf Agro Logistics', category: 'VENDOR' },
];

export const DONORS = [
  {
    id: 'DONOR-001',
    name: 'Individual Donor — Sample A',
    category: 'INDIVIDUAL',
    funds: [
      { id: 'FUND-001', name: 'General Fund', balance: 850000, grants: ['GA-2026-001'] },
      { id: 'FUND-002', name: 'Restricted — Program A', balance: 320000, grants: ['GA-2026-002'] },
    ],
  },
  {
    id: 'DONOR-002',
    name: 'Corporate Donor — Sample B',
    category: 'CORPORATE',
    funds: [
      { id: 'FUND-003', name: 'Restricted — Program B', balance: 410000, grants: ['GA-2026-003'] },
      { id: 'FUND-004', name: 'Corpus Fund', balance: 1200000, grants: ['GA-2026-004'] },
    ],
  },
  {
    id: 'DONOR-003',
    name: 'Foundation Donor — Sample C',
    category: 'FOUNDATION',
    funds: [
      { id: 'FUND-001', name: 'General Fund', balance: 850000, grants: ['GA-2026-001'] },
      { id: 'FUND-004', name: 'Corpus Fund', balance: 1200000, grants: ['GA-2026-004'] },
    ],
  },
];

export const BANK_ACCOUNTS = [
  { value: 'ACC-HDFC-4521', label: 'HDFC — Operating A/c ****4521' },
  { value: 'ACC-ICICI-8890', label: 'ICICI — Restricted A/c ****8890' },
  { value: 'ACC-SBI-1123', label: 'SBI — Corpus A/c ****1123' },
  { value: 'ACC-CASH', label: 'Cash in Hand' },
];

export const PAYMENT_MODES = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK', label: 'Bank' },
  { value: 'UPI', label: 'UPI' },
  { value: 'CHEQUE', label: 'Cheque' },
];

export const CREDIT_GROUPS = [
  { value: 'DONATION_INDIVIDUAL', label: 'Donation — Individual' },
  { value: 'DONATION_CORPORATE', label: 'Donation — Corporate / CSR' },
  { value: 'GRANT_INCOME', label: 'Grant Income' },
];

export const LEDGER_TYPES = [
  { value: 'GENERAL_FUND', label: 'General Fund' },
  { value: 'RESTRICTED_PROGRAM_A', label: 'Restricted — Program A' },
  { value: 'RESTRICTED_PROGRAM_B', label: 'Restricted — Program B' },
  { value: 'CORPUS_FUND', label: 'Corpus Fund' },
  { value: 'ADMIN_OVERHEADS', label: 'Admin & Overheads' },
];

export const MOCK_TRANSACTIONS = [
  {
    id: 'ZAR-489213',
    type: 'DEBIT',
    book: 'LC',
    date: '2026-08-21',
    partyName: 'Apex Solar Technologies Pvt Ltd',
    donorName: 'Corporate Donor — Sample B',
    fundName: 'Restricted — Program B',
    grantId: 'GA-2026-003',
    amount: 185000,
    paymentModeLabel: 'Bank',
    bankAccountLabel: 'HDFC — Operating A/c ****4521',
    reference: 'NEFT/HD2608211842',
    groupLabel: 'Income & Expenditure Heads',
    ledgerLabel: 'Project Equipment Procurement & Material Supply (4200-EXP)',
    notes: 'Balance payment for rooftop solar installation, Nagpur cluster.',
  },
  {
    id: 'ZAR-489207',
    type: 'CREDIT',
    book: 'FC',
    date: '2026-08-19',
    partyName: 'Individual Donor — Sample A',
    donorName: 'Individual Donor — Sample A',
    fundName: 'General Fund',
    grantId: 'GA-2026-001',
    amount: 500000,
    paymentModeLabel: 'UPI',
    bankAccountLabel: 'SBI — Corpus A/c ****1123',
    reference: 'UPI/2608191204778',
    groupLabel: 'Donation — Individual',
    ledgerLabel: 'General Fund',
    notes: 'Annual major-gift contribution.',
  },
  {
    id: 'ZAR-489188',
    type: 'DEBIT',
    book: 'LC',
    date: '2026-08-14',
    partyName: 'Aarav Sharma',
    donorName: 'Foundation Donor — Sample C',
    fundName: 'Corpus Fund',
    grantId: 'GA-2026-004',
    amount: 42500,
    paymentModeLabel: 'Cash',
    bankAccountLabel: 'Cash in Hand',
    reference: 'Cash voucher #CV-1142',
    groupLabel: 'Income & Expenditure Heads',
    ledgerLabel: 'Staff Travel & Imprest Advances (1310-CA)',
    notes: 'Field visit travel advance — Rajasthan programme review.',
  },
  {
    id: 'ZAR-489160',
    type: 'CREDIT',
    book: 'LC',
    date: '2026-08-09',
    partyName: 'Corporate Donor — Sample B',
    donorName: 'Corporate Donor — Sample B',
    fundName: 'Corpus Fund',
    grantId: 'GA-2026-004',
    amount: 1200000,
    paymentModeLabel: 'Cheque',
    bankAccountLabel: 'ICICI — Restricted A/c ****8890',
    reference: 'Cheque #004521',
    groupLabel: 'Donation — Corporate / CSR',
    ledgerLabel: 'Corpus Fund',
    notes: 'CSR corpus contribution for FY2026-27.',
  },
  {
    id: 'ZAR-489142',
    type: 'DEBIT',
    book: 'FC',
    date: '2026-08-05',
    partyName: 'Greenleaf Agro Logistics',
    donorName: 'Foundation Donor — Sample C',
    fundName: 'General Fund',
    grantId: 'GA-2026-001',
    amount: 76300,
    paymentModeLabel: 'Bank',
    bankAccountLabel: 'HDFC — Operating A/c ****4521',
    reference: 'NEFT/HD2608051105',
    groupLabel: 'Income & Expenditure Heads',
    ledgerLabel: 'Programme Implementation & Field Operations (4100-EXP)',
    notes: 'Cold storage transport for seed distribution, Q3 cycle.',
  },
];
