import { ApiError } from '../../lib/api/ApiError.js';

/**
 * Authentication repository — the single adapter between the app and the
 * backend authentication capability.
 *
 * BACKEND REALITY (verified against backend/finance on this branch):
 *   - UserLoginController (/api/userLogin) exists but exposes ZERO endpoints.
 *   - SecurityConfig permits only /api/public/** and Swagger; there is no
 *     login mechanism (no httpBasic/formLogin/JWT filter) configured.
 *
 * Per the platform rules we do not invent endpoints. login() therefore fails
 * fast with a precise, typed error that the UI surfaces verbatim. When the
 * backend ships its login endpoint, THIS FILE is the only place that changes.
 * See docs/BACKEND_GAPS.md #1 and docs/adr/ADR-0004.
 */

export const AUTH_NOT_IMPLEMENTED_CODE = 'AUTH_ENDPOINT_MISSING';

export const authRepository = {
  /**
   * @returns {Promise<never>} Always rejects until the backend exposes a
   * login endpoint under /api/userLogin.
   */
  async login() {
    throw new ApiError({
      message:
        'Sign-in is not available yet: the backend /api/userLogin controller has no endpoints. ' +
        'Use "Continue in review mode" until backend authentication ships.',
      status: 501,
      code: AUTH_NOT_IMPLEMENTED_CODE,
    });
  },
};
