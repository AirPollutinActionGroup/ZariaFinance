import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/v1/user-registrations (UserRegisterNewController).
 * Extended registration — captures a Role Directory role and Organisation
 * alongside the account fields the legacy /api/userRegister endpoint takes.
 */
export const userRegisterNewApi = {
  /** POST /api/v1/user-registrations — body: CreateUserRegisterRequest → UserRegisterResponse (201). */
  register: (payload) => http.post('/v1/user-registrations', payload),

  /** GET /api/v1/user-registrations/verify-username?username= → { username, exists }. */
  verifyUsername: (username) =>
    http.get('/v1/user-registrations/verify-username', { params: { username } }),
};
