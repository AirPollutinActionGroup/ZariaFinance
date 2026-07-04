/**
 * Centralised, validated access to build-time environment configuration.
 *
 * Every environment variable consumed by the application MUST be declared
 * here. Nothing else in the codebase may read import.meta.env directly —
 * this is the single seam between the build environment and the app.
 */

const raw = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};

export const env = Object.freeze({
  /** Base URL for the backend API. Relative by default so nginx / Vite proxy route it. */
  apiBaseUrl: raw.VITE_API_BASE_URL || '/api',

  /** Request timeout in milliseconds for the Axios client. */
  apiTimeoutMs: Number(raw.VITE_API_TIMEOUT_MS || 30000),

  /**
   * Role granted to a "review mode" session while the backend login endpoint
   * (/api/userLogin) is not implemented. See docs/BACKEND_GAPS.md #1 and ADR-0004.
   */
  reviewModeRole: raw.VITE_REVIEW_MODE_ROLE || 'FINANCE_OFFICER',

  /** Approval authority surfaced on the pending-approval screen. */
  approvalAuthorityEmail: raw.VITE_APPROVAL_AUTHORITY_EMAIL || 'technology@a-pag.org',

  mode: raw.MODE || 'development',
  isDev: Boolean(raw.DEV),
});
