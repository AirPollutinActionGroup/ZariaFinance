export const VOUCHER_TYPES = [
  { value: 'DEBIT_NOTE', label: 'Debit Note', desc: 'Expense / Payment voucher (Dr expense/party, Cr bank/cash)' },
  { value: 'CREDIT_NOTE', label: 'Credit Note', desc: 'Income / Receipt voucher (Dr bank/cash, Cr revenue/party)' },
];

import { BOOK } from '../../donation-management/constants.js';

export { BOOK };

export const PARTY_CATEGORIES = [
  { value: 'EMPLOYEE', label: 'Employee', desc: 'Staff reimbursements, salaries, advances, or travel claims' },
  { value: 'VENDOR', label: 'Vendor / Supplier', desc: 'Procurement, contractors, operational services, utilities' },
  { value: 'BENEFICIARY', label: 'Beneficiary', desc: 'Direct project assistance, scholarships, relief disbursals' },
];

export const ACCOUNT_GROUPS = [
  { value: 'BALANCE_SHEET', label: 'Balance Sheet' },
  { value: 'INCOME_AND_EXPENDITURE', label: 'Income & Expenditure Heads' },
];

export const DR_CR_OPTIONS = [
  { value: 'DEBIT', label: 'Debit (Dr)' },
  { value: 'CREDIT', label: 'Credit (Cr)' },
];

export const ENTITY_TYPES = PARTY_CATEGORIES;

export const PAYMENT_MODES = [
  { id: 'CASH', label: 'Cash', reqRef: false, refPlaceholder: 'Cash receipt / voucher no.' },
  { id: 'CHEQUE', label: 'Cheque', reqRef: true, refPlaceholder: 'Enter 6-digit Cheque no.' },
  { id: 'NEFT', label: 'NEFT', reqRef: true, refPlaceholder: 'Enter 16-digit UTR no. (e.g. N02624009182)' },
  { id: 'RTGS', label: 'RTGS', reqRef: true, refPlaceholder: 'Enter 22-digit UTR no. (e.g. UTIB20260824982)' },
  { id: 'IMPS', label: 'IMPS', reqRef: true, refPlaceholder: 'Enter 12-digit RRN / Ref no.' },
  { id: 'UPI', label: 'UPI', reqRef: true, refPlaceholder: 'Enter UPI transaction / VPA ref' },
  { id: 'CARD', label: 'Card', reqRef: true, refPlaceholder: 'Enter Auth / Approval code' },
  { id: 'DEMAND_DRAFT', label: 'Demand Draft', reqRef: true, refPlaceholder: 'Enter 6-digit DD no.' },
  { id: 'AUTO_DEBIT', label: 'Auto-debit (NACH)', reqRef: true, refPlaceholder: 'Enter NACH / Mandate ref' },
  { id: 'IN_KIND', label: 'In-kind (non-cash)', reqRef: false, refPlaceholder: 'Material delivery note / challan no.' },
];

export const MOCK_PARTIES = {
  EMPLOYEE: [
    { id: 'EMP-001', name: 'Aarav Sharma', detail: 'Programme Director — Climate & Water', role: 'Staff #1042' },
    { id: 'EMP-002', name: 'Priya Narang', detail: 'Finance Lead — Accounts & Audits', role: 'Staff #1089' },
    { id: 'EMP-003', name: 'Dr. Vikram Sethi', detail: 'Field Operations Coordinator — Rural Health', role: 'Staff #1105' },
    { id: 'EMP-004', name: 'Ananya Deshmukh', detail: 'Monitoring & Evaluation Lead', role: 'Staff #1134' },
  ],
  VENDOR: [
    { id: 'VEN-201', name: 'Apex Solar Technologies Pvt Ltd', detail: 'Solar panels, inverters & installation equipment', role: 'GSTIN: 07AAACA1234F1Z5' },
    { id: 'VEN-202', name: 'Greenleaf Agro Logistics', detail: 'Cold storage transport & organic seeds supply', role: 'GSTIN: 06BBBCB5678G2Z3' },
    { id: 'VEN-203', name: 'Pinnacle Water Solutions LLP', detail: 'Water filtration plants & pipeline hardware', role: 'GSTIN: 27CCCCP9012H1Z1' },
    { id: 'VEN-204', name: 'Deloitte Touche Tohmatsu India', detail: 'Statutory compliance & annual project audit', role: 'GSTIN: 07DDDDA3456J1Z9' },
  ],
  BENEFICIARY: [
    { id: 'BEN-401', name: 'Kisan Samriddhi Self Help Group', detail: 'Community water shed management cluster (Nagpur)', role: 'Beneficiary Group #401' },
    { id: 'BEN-402', name: 'Meera Devi', detail: 'Solar pump agricultural livelihood grant recipient', role: 'Aadhaar / ID #8841' },
    { id: 'BEN-403', name: 'Govt. Senior Secondary School (Dholpur)', detail: 'Clean drinking water and rooftop solar installation', role: 'UDISE #080302001' },
    { id: 'BEN-404', name: 'Swachh Jal Seva Samiti', detail: 'Village water purification kiosk committee', role: 'Reg #DL-9932' },
  ],
};

export const MOCK_ACCOUNTS = [
  // FC Book Accounts
  {
    id: 'ACC-FC-01',
    book: 'FC',
    accountName: 'HDFC FCRA A/c',
    accountNumber: 'XXXX-XXXX-5541',
    bank: 'HDFC Bank, Vasant Vihar Branch',
    balance: 8450000,
    currency: 'INR',
    type: 'Bank Account',
    description: 'Designated secondary FCRA utilization account',
  },
  {
    id: 'ACC-FC-02',
    book: 'FC',
    accountName: 'SBI FCRA Main Branch A/c',
    accountNumber: 'XXXX-XXXX-9912',
    bank: 'State Bank of India, NDMB Parliament Street',
    balance: 14200000,
    currency: 'INR',
    type: 'Bank Account',
    description: 'Mandatory central FCRA designated receiving account',
  },
  {
    id: 'ACC-FC-03',
    book: 'FC',
    accountName: 'Standard Chartered FCRA Operational',
    accountNumber: 'XXXX-XXXX-1084',
    bank: 'Standard Chartered, Connaught Place',
    balance: 3120000,
    currency: 'INR',
    type: 'Bank Account',
    description: 'Programme implementation & foreign grants expense',
  },

  // LC Book Accounts
  {
    id: 'ACC-LC-01',
    book: 'LC',
    accountName: 'Domestic Current A/c - HDFC',
    accountNumber: 'XXXX-XXXX-8820',
    bank: 'HDFC Bank, GK-1 Branch',
    balance: 6240000,
    currency: 'INR',
    type: 'Bank Account',
    description: 'Primary domestic corporate donations & CSR grants',
  },
  {
    id: 'ACC-LC-02',
    book: 'LC',
    accountName: 'ICICI Main Operating A/c',
    accountNumber: 'XXXX-XXXX-3342',
    bank: 'ICICI Bank, Barakhamba Road',
    balance: 4180000,
    currency: 'INR',
    type: 'Bank Account',
    description: 'General operational expenditures and payroll funding',
  },
  {
    id: 'ACC-LC-03',
    book: 'LC',
    accountName: 'Axis Bank Programme Disbursal',
    accountNumber: 'XXXX-XXXX-7719',
    bank: 'Axis Bank, Green Park Branch',
    balance: 1950000,
    currency: 'INR',
    type: 'Bank Account',
    description: 'Field programme direct vendor payments',
  },
  {
    id: 'ACC-LC-04',
    book: 'LC',
    accountName: 'Petty Cash - Delhi HQ',
    accountNumber: 'CASH-HQ-01',
    bank: 'Cash-in-Hand',
    balance: 48500,
    currency: 'INR',
    type: 'Cash Account',
    description: 'Daily office routine disbursements & travel petty cash',
  },
  {
    id: 'ACC-LC-05',
    book: 'LC',
    accountName: 'Petty Cash - Rajasthan Field Office',
    accountNumber: 'CASH-FLD-02',
    bank: 'Cash-in-Hand',
    balance: 32000,
    currency: 'INR',
    type: 'Cash Account',
    description: 'Field camp logistical expenses & community outreach',
  },
];

export const MOCK_LEDGERS = [
  // Balance Sheet Ledgers
  {
    id: 'LED-BS-01',
    group: 'BALANCE_SHEET',
    name: 'Solar Infrastructure & Plant Equipment',
    code: '1100-FA',
    bucket: 'Fixed Assets',
    capExOpEx: 'CapEx',
    defaultSide: 'Dr',
  },
  {
    id: 'LED-BS-02',
    group: 'BALANCE_SHEET',
    name: 'Office IT & Hardware Assets',
    code: '1200-FA',
    bucket: 'Fixed Assets',
    capExOpEx: 'CapEx',
    defaultSide: 'Dr',
  },
  {
    id: 'LED-BS-03',
    group: 'BALANCE_SHEET',
    name: 'Staff Travel & Imprest Advances',
    code: '1310-CA',
    bucket: 'Current Assets / Advances',
    capExOpEx: 'OpEx',
    defaultSide: 'Dr',
  },
  {
    id: 'LED-BS-04',
    group: 'BALANCE_SHEET',
    name: 'Security Deposits & Prepayments',
    code: '1320-CA',
    bucket: 'Current Assets / Deposits',
    capExOpEx: 'CapEx',
    defaultSide: 'Dr',
  },
  {
    id: 'LED-BS-05',
    group: 'BALANCE_SHEET',
    name: 'Vendor & Contractor Payables',
    code: '2100-CL',
    bucket: 'Current Liabilities',
    capExOpEx: 'OpEx',
    defaultSide: 'Cr',
  },
  {
    id: 'LED-BS-06',
    group: 'BALANCE_SHEET',
    name: 'TDS & Statutory Dues Payable',
    code: '2200-CL',
    bucket: 'Duties & Taxes',
    capExOpEx: 'OpEx',
    defaultSide: 'Cr',
  },
  {
    id: 'LED-BS-07',
    group: 'BALANCE_SHEET',
    name: 'General Corpus Fund / Capital Reserve',
    code: '3000-EQ',
    bucket: 'Corpus & Reserves',
    capExOpEx: 'CapEx',
    defaultSide: 'Cr',
  },

  // Income & Expenditure Heads Ledgers
  {
    id: 'LED-IE-01',
    group: 'INCOME_AND_EXPENDITURE',
    name: 'Programme Implementation & Field Operations',
    code: '4100-EXP',
    bucket: 'Programme Costs',
    capExOpEx: 'OpEx',
    defaultSide: 'Dr',
  },
  {
    id: 'LED-IE-02',
    group: 'INCOME_AND_EXPENDITURE',
    name: 'Project Equipment Procurement & Material Supply',
    code: '4200-EXP',
    bucket: 'Direct Project Costs',
    capExOpEx: 'CapEx',
    defaultSide: 'Dr',
  },
  {
    id: 'LED-IE-03',
    group: 'INCOME_AND_EXPENDITURE',
    name: 'Direct Community Assistance & Subsidies',
    code: '4300-EXP',
    bucket: 'Beneficiary Disbursements',
    capExOpEx: 'OpEx',
    defaultSide: 'Dr',
  },
  {
    id: 'LED-IE-04',
    group: 'INCOME_AND_EXPENDITURE',
    name: 'Administrative Overheads & Office Running',
    code: '5100-EXP',
    bucket: 'Administrative Expenses',
    capExOpEx: 'OpEx',
    defaultSide: 'Dr',
  },
  {
    id: 'LED-IE-05',
    group: 'INCOME_AND_EXPENDITURE',
    name: 'Professional Legal & Statutory Audit Fees',
    code: '5200-EXP',
    bucket: 'Compliance & Professional',
    capExOpEx: 'OpEx',
    defaultSide: 'Dr',
  },
  {
    id: 'LED-IE-06',
    group: 'INCOME_AND_EXPENDITURE',
    name: 'Grant Revenue & Institutional Contributions',
    code: '6100-INC',
    bucket: 'Grant Income',
    capExOpEx: 'OpEx',
    defaultSide: 'Cr',
  },
  {
    id: 'LED-IE-07',
    group: 'INCOME_AND_EXPENDITURE',
    name: 'Bank Interest & Investment Returns',
    code: '6200-INC',
    bucket: 'Other Incomes',
    capExOpEx: 'OpEx',
    defaultSide: 'Cr',
  },
];
