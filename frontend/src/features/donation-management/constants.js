/**
 * Frontend mirror of backend enums. Values MUST match the Java enums in
 * backend/finance/src/main/java/com/ngo/finance/donation/enums exactly —
 * never rename; labels mirror each enum's label field.
 */

export const MODULE_ID = 'donation-management';

export const DONATION_TYPE = Object.freeze({
  MAJOR_GIFT: 'Major gift / HNI',
  ONE_TIME: 'One-time donation',
  RECURRING: 'Recurring giving',
  PAYROLL_GIVING: 'Payroll giving',
  LEGACY: 'Legacy / bequest — DORMANT (not available)',
  GIK: 'Gift in kind',
  CORPUS: 'Corpus',
});

export const DONATION_CHANNEL = Object.freeze({
  BANK_TRANSFER: 'Bank transfer / NEFT / RTGS',
  CHEQUE: 'Cheque',
  CASH: 'Cash',
  UPI: 'UPI',
  CARD: 'Card',
  STANDING_INSTRUCTION: 'Standing instruction',
  IN_KIND: 'In-kind — no cash',
});

export const BOOK = Object.freeze({
  LC: 'Local contribution',
  FC: 'Foreign contribution',
});

export const DONOR_IDENTIFICATION = Object.freeze({
  NAMED: 'Named donor',
  ANONYMOUS: 'Anonymous',
});

export const INDIVIDUAL_ID_TYPE = Object.freeze({
  PAN: 'PAN Card',
  AADHAR: 'Aadhaar Card',
  VOTER_ID: 'Voter ID',
  DRIVING_LICENSE: 'Driving License',
  PASSPORT: 'Passport ID',
  FOREIGN_TAX_ID: 'Foreign Tax Identification Number',
});

export const FUND_MODE = Object.freeze({
  UNRESTRICTED: 'Unrestricted',
  RESTRICTED: 'Restricted',
});

export const UTILISATION_PERIOD_TYPE = Object.freeze({
  SINGLE_FY: 'Single financial year',
  MULTI_YEAR: 'Multi-year',
  DEFINED_PERIOD: 'Defined period',
  PERPETUAL_CORPUS: 'Perpetual — corpus',
});

export const RECOGNITION_STATUS = Object.freeze({
  INCOME_RECOGNISED: 'Income recognised',
  DEFERRED_INCOME: 'Deferred income — conditional gift',
  CAPITAL_NOT_INCOME: 'Capital — not income',
  IN_PROBATE: 'In probate — not income',
  PENDING: 'Pending',
});

export const BANK_ACCOUNT_TYPE = Object.freeze({
  DOMESTIC_CURRENT: 'Domestic — current account',
  FCRA_DESIGNATED: 'FCRA designated account',
});

export const EIGHTY_G_STATUS = Object.freeze({
  NOT_ELIGIBLE_ORG_NOT_REGISTERED: 'Not eligible — organisation not registered',
  NOT_ELIGIBLE_GIFT_IN_KIND: 'Not eligible — gift in kind',
  NOT_ELIGIBLE_ANONYMOUS: 'Not eligible — no identified donor to receipt',
  ELIGIBLE_PENDING_ISSUE: 'Eligible — receipt will be issued on save',
  ISSUED: 'Issued',
});

export const TEN_BE_STATUS = Object.freeze({
  NOT_APPLICABLE: 'Not applicable',
  DUE_AFTER_FY_CLOSE: 'Due after FY close',
  PENDING_10BD_FILING: 'Pending 10BD filing',
  ISSUED: 'Issued',
  OVERDUE: 'Overdue',
});

export const GIK_VALUATION_BASIS = Object.freeze({
  MARKET_QUOTATION: 'Market quotation',
  SUPPLIER_INVOICE: 'Supplier invoice',
  REGISTERED_VALUER_CERTIFICATE: 'Registered valuer certificate',
  DONOR_DECLARATION: 'Donor declaration',
});

export const GIK_INTENDED_USE = Object.freeze({
  DISTRIBUTE_FREE: 'Distribute free to beneficiaries',
  USE_INTERNALLY: 'Use internally / consume in operations',
  RETAIN_FIXED_ASSET: 'Retain and use as a fixed asset',
  SELL_CONVERT_CASH: 'Sell / convert to cash',
});

export const GIK_REALISATION_STATUS = Object.freeze({
  PENDING: 'Pending',
  DISTRIBUTED: 'Distributed',
  SOLD: 'Sold',
  USED: 'Used',
  OVERDUE: 'Overdue — liquidation deadline passed',
});

export const INVESTMENT_MODE = Object.freeze({
  SCHEDULED_BANK_DEPOSIT: 'Scheduled bank deposit',
  GOVERNMENT_SECURITIES: 'Government securities',
  POST_OFFICE_SAVINGS: 'Post office savings',
  UNITS_OF_UTI: 'Units of UTI',
  OTHER_PERMITTED_MODE: 'Other permitted mode',
});

export const MANDATE_FREQUENCY = Object.freeze({
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  HALF_YEARLY: 'Half-yearly',
  ANNUAL: 'Annual',
});

export const MANDATE_STATUS = Object.freeze({
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
});

export const SPONSORSHIP_TIE = Object.freeze({
  NONE: '— none —',
  CHILD_SPONSORSHIP: 'Child sponsorship',
  PROGRAMME_SPONSORSHIP: 'Programme sponsorship',
});

export const BEQUEST_STATUS = Object.freeze({
  NOTIFIED: 'Notified',
  IN_PROBATE: 'In probate',
  RECEIVED: 'Received',
});

export const ESTATE_DOMICILE = Object.freeze({
  DOMESTIC: 'Domestic',
  FOREIGN: 'Foreign — FCRA applies on realisation',
});

export const CITIZENSHIP = Object.freeze({
  INDIAN: 'Indian',
  FOREIGN: 'Foreign',
});

export const EMPLOYER_MATCH_ROUTING = Object.freeze({
  PAYROLL_GIVING_TAGGED: 'Keep in payroll giving — tagged',
  CSR_ROUTED: 'Treat as CSR — route to 1103',
});

/** enum object → [{value, label}] for selects. */
export function toOptions(enumMap) {
  return Object.entries(enumMap).map(([value, label]) => ({ value, label }));
}

/** Donation types allowed when identification = ANONYMOUS (mirrors the backend gate). */
export const ANONYMOUS_ALLOWED_TYPES = ['ONE_TIME', 'MAJOR_GIFT', 'GIK'];

/** UI tone mapping for StatusChip (presentation concern, single source). */
export const BOOK_TONE = Object.freeze({ LC: 'neutral', FC: 'graphite' });

export const FUND_MODE_TONE = Object.freeze({ UNRESTRICTED: 'success', RESTRICTED: 'warning' });

export const RECOGNITION_STATUS_TONE = Object.freeze({
  INCOME_RECOGNISED: 'success',
  DEFERRED_INCOME: 'warning',
  CAPITAL_NOT_INCOME: 'info',
  IN_PROBATE: 'warning',
  PENDING: 'neutral',
});

export const EIGHTY_G_STATUS_TONE = Object.freeze({
  NOT_ELIGIBLE_ORG_NOT_REGISTERED: 'error',
  NOT_ELIGIBLE_GIFT_IN_KIND: 'neutral',
  NOT_ELIGIBLE_ANONYMOUS: 'error',
  ELIGIBLE_PENDING_ISSUE: 'warning',
  ISSUED: 'success',
});

export const TEN_BE_STATUS_TONE = Object.freeze({
  NOT_APPLICABLE: 'neutral',
  DUE_AFTER_FY_CLOSE: 'warning',
  PENDING_10BD_FILING: 'warning',
  ISSUED: 'success',
  OVERDUE: 'error',
});

export const MANDATE_STATUS_TONE = Object.freeze({
  ACTIVE: 'success',
  PAUSED: 'warning',
  FAILED: 'error',
  CANCELLED: 'neutral',
});

export const GIK_REALISATION_STATUS_TONE = Object.freeze({
  PENDING: 'neutral',
  DISTRIBUTED: 'success',
  SOLD: 'success',
  USED: 'success',
  OVERDUE: 'error',
});
