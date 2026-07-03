/**
 * Indian-numbering currency formatting used across all financial views.
 * Mirrors the presentation in the approved design: ₹1.20 Cr, ₹80.00 L.
 */

const CRORE = 10_000_000;
const LAKH = 100_000;

/**
 * Formats an amount in INR using Crore/Lakh units.
 * @param {number|string|null|undefined} value
 * @returns {string} e.g. "₹1.20 Cr", "₹80.00 L", "₹4,500", "—" for empty input.
 */
export function formatInr(value) {
  if (value === null || value === undefined || value === '') return '—';
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '—';

  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= CRORE) return `${sign}₹${(abs / CRORE).toFixed(2)} Cr`;
  if (abs >= LAKH) return `${sign}₹${(abs / LAKH).toFixed(2)} L`;
  return `${sign}₹${abs.toLocaleString('en-IN')}`;
}

/** Full-precision INR for detail views and tooltips: ₹1,20,00,000. */
export function formatInrExact(value) {
  if (value === null || value === undefined || value === '') return '—';
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '—';
  return `₹${amount.toLocaleString('en-IN')}`;
}
