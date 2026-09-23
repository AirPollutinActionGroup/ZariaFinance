export const MODULE_ID = 'vendor-registration';

export const VENDOR_TYPE_OPTIONS = [
  { value: 'Individual', label: 'Individual' },
  { value: 'Organisation', label: 'Organisation' },
];

/** Organisation sub-types — "Individual" is chosen via Vendor Type instead. */
export const ENTITY_TYPE_OPTIONS = [
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
  { value: 'SEZ', label: 'SEZ' },
];

export const TDS_SECTION_OPTIONS = [
  { value: '194C', label: '194C — Contractors' },
  { value: '194J', label: '194J — Professional / Technical Services' },
];

export const VENDOR_CATEGORY_OPTIONS = [
  { value: 'Goods', label: 'Goods' },
  { value: 'Services', label: 'Services' },
  { value: 'Consulting', label: 'Consulting' },
  { value: 'Logistics', label: 'Logistics' },
  { value: 'IT', label: 'IT' },
  { value: 'Grantee-linked', label: 'Grantee-linked' },
];

export const ENTERPRISE_CLASSIFICATION_OPTIONS = [
  { value: 'Micro', label: 'Micro' },
  { value: 'Small', label: 'Small' },
  { value: 'Medium', label: 'Medium' },
];

export const YES_NO_OPTIONS = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
];

/**
 * Documents section — Aadhaar is Individual-only; GST Certificate is
 * non-Individual only. `requiredFor` may instead be an array of exact
 * Entity Type values, for documents specific to one organisation sub-type
 * (e.g. Incorporation Certificate only for LLP / Pvt Ltd).
 */
export const VENDOR_DOCUMENTS = [
  { key: 'pan', label: 'PAN Card', requiredFor: 'all' },
  { key: 'aadhaar', label: 'Aadhaar Card', requiredFor: 'individual' },
  { key: 'gst', label: 'GST Certificate', requiredFor: 'non-individual' },
  { key: 'cancelledCheque', label: 'Cancelled Cheque', requiredFor: 'all' },
  { key: 'incorporation', label: 'Incorporation Certificate', requiredFor: ['LLP', 'Pvt Ltd'] },
  { key: 'partnershipDeed', label: 'Partnership Deed', requiredFor: ['Partnership'] },
  { key: 'trustDeed', label: 'Trust Deed / Registration Certificate', requiredFor: ['Trust'] },
  { key: 'section8Licence', label: 'Section 8 Licence', requiredFor: ['Section 8'] },
];
