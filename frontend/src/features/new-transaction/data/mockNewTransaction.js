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

export const PAYEES = [
  { id: 'PAYEE-001', name: 'Aarav Sharma', category: 'EMPLOYEE' },
  { id: 'PAYEE-002', name: 'Priya Narang', category: 'EMPLOYEE' },
  { id: 'PAYEE-003', name: 'Apex Solar Technologies Pvt Ltd', category: 'VENDOR' },
  { id: 'PAYEE-004', name: 'Greenleaf Agro Logistics', category: 'VENDOR' },
];
