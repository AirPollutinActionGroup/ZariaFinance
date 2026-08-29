const IFSC_FORMAT = /^[A-Z]{4}0[A-Z0-9]{6}$/;

/** First 4 characters of an IFSC identify the bank. Small demo set — extend as needed. */
const BANK_PREFIX_MAP = {
  SBIN: 'State Bank of India',
  HDFC: 'HDFC Bank',
  ICIC: 'ICICI Bank',
  PUNB: 'Punjab National Bank',
  UTIB: 'Axis Bank',
  KKBK: 'Kotak Mahindra Bank',
  IDFB: 'IDFC First Bank',
  YESB: 'Yes Bank',
  INDB: 'IndusInd Bank',
  BARB: 'Bank of Baroda',
};

/**
 * Mock IFSC → bank/branch lookup standing in for a real bank-directory API.
 * Returns null when the IFSC isn't well-formed or the prefix isn't recognised.
 */
export function lookupIfsc(ifscCode) {
  const code = (ifscCode || '').toUpperCase();
  if (!IFSC_FORMAT.test(code)) return null;
  const bankName = BANK_PREFIX_MAP[code.slice(0, 4)];
  if (!bankName) return null;
  return {
    bankName,
    branchName: `${code.slice(4)} Branch`,
  };
}
