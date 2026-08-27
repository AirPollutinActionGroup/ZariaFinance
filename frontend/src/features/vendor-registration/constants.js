export const MODULE_ID = 'vendor-registration';

export const ENTITY_TYPE_OPTIONS = [
  { value: 'Individual', label: 'Individual' },
  { value: 'Proprietorship', label: 'Proprietorship' },
  { value: 'Partnership', label: 'Partnership' },
  { value: 'Pvt Ltd', label: 'Pvt Ltd' },
  { value: 'LLP', label: 'LLP' },
  { value: 'Trust', label: 'Trust' },
  { value: 'Section 8', label: 'Section 8' },
];

export const GST_REGISTRATION_TYPE_OPTIONS = [
  { value: 'Regular', label: 'Regular' },
  { value: 'Composition', label: 'Composition' },
  { value: 'Unregistered', label: 'Unregistered' },
  { value: 'SEZ', label: 'SEZ' },
];

export const TDS_SECTION_OPTIONS = [
  { value: '194C', label: '194C — Contractors' },
  { value: '194J', label: '194J — Professional / Technical Services' },
];

export const PAYMENT_MODE_OPTIONS = [
  { value: 'NEFT', label: 'NEFT' },
  { value: 'RTGS', label: 'RTGS' },
  { value: 'UPI', label: 'UPI' },
  { value: 'Cheque', label: 'Cheque' },
];

export const VENDOR_CATEGORY_OPTIONS = [
  { value: 'Goods', label: 'Goods' },
  { value: 'Services', label: 'Services' },
  { value: 'Consulting', label: 'Consulting' },
  { value: 'Logistics', label: 'Logistics' },
  { value: 'IT', label: 'IT' },
  { value: 'Grantee-linked', label: 'Grantee-linked' },
];

export const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

/** Documents section — Aadhaar is Individual-only; GST Certificate and Incorporation Cert. are non-Individual only. */
export const VENDOR_DOCUMENTS = [
  { key: 'pan', label: 'PAN Card', requiredFor: 'all' },
  { key: 'aadhaar', label: 'Aadhaar Card', requiredFor: 'individual' },
  { key: 'gst', label: 'GST Certificate', requiredFor: 'non-individual' },
  { key: 'cancelledCheque', label: 'Cancelled Cheque', requiredFor: 'all' },
  { key: 'incorporation', label: 'Incorporation Certificate', requiredFor: 'non-individual' },
];
