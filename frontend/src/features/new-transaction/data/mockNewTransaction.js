import { DONOR_TYPE, toOptions } from '../../donor-management/constants.js';

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

export const BANK_ACCOUNTS = [
  { value: 'ACC-HDFC-4521', label: 'HDFC — Operating A/c ****4521' },
  { value: 'ACC-ICICI-8890', label: 'ICICI — Restricted A/c ****8890' },
  { value: 'ACC-SBI-1123', label: 'SBI — Corpus A/c ****1123' },
  { value: 'ACC-CASH', label: 'Cash in Hand' },
];
