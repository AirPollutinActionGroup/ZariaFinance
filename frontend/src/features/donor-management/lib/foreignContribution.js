/**
 * Foreign contribution (FC book) helpers — pure, no React. The backend stores
 * INR only; these derive INR from a foreign amount and an FX rate.
 */

/** Currencies the backend FX table holds reference rates for (fx_rate seed). */
export const FC_CURRENCIES = ['USD', 'EUR', 'GBP', 'CHF', 'JPY', 'AUD', 'CAD', 'SGD'];

export const CURRENCY_SYMBOL = { USD: '$', EUR: '€', GBP: '£', CHF: 'CHF', JPY: '¥', AUD: 'A$', CAD: 'C$', SGD: 'S$' };

/** Today as YYYY-MM-DD in local time — the default date to lock the FX rate on. */
export function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Form defaults for the foreign-contribution fields. */
export const foreignContributionDefaults = {
  fcCurrency: 'USD',
  fcAmount: '',
  fcRateDate: todayIso(),
  fcRate: '',
};

/** "USD 1,20,000" — a foreign amount for display. */
export function formatForeign(currency, amount) {
  const n = Number(amount) || 0;
  return `${currency || ''} ${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`.trim();
}

/** Rounded INR value of amount × rate, or null if either is missing. */
export function inrFromForeign(amount, rate) {
  const a = Number(amount);
  const r = Number(rate);
  if (!(a > 0) || !(r > 0)) return null;
  return Math.round(a * r * 100) / 100;
}
