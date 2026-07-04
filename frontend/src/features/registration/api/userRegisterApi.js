import { http } from '../../../lib/api/apiClient.js';

/**
 * Repository for /api/userRegister (UserRegisterController).
 * Only registration exists today; approval/rejection endpoints are a
 * documented backend gap (docs/BACKEND_GAPS.md #2).
 */
export const userRegisterApi = {
  /** POST /api/userRegister — body: AddUserRegisterDto → UserRegisterDto (201). */
  register: (payload) => http.post('/userRegister', payload),
};
