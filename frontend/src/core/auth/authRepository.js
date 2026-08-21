import { http } from '../../lib/api/apiClient.js';
import { USER_STATUS } from '../permissions/permissions.js';

export const AUTH_NOT_IMPLEMENTED_CODE = 'AUTH_ENDPOINT_MISSING';

export const authRepository = {
  /**
   * Performs the real login request to the backend.
   * @param {Object} credentials - { username, password }
   */
  async login(credentials) {
    const userDto = await http.post('/userLogin', credentials);

    // permissionRole is resolved server-side from the account's role_master
    // entry; fall back to the least-privileged tier if it's ever missing.
    const mappedRole = userDto.permissionRole || 'FUNDRAISING_LEAD';

    // Map status: status in backend is Boolean (true = approved/active, false = disabled)
    const mappedStatus = userDto.status === false ? USER_STATUS.DISABLED : USER_STATUS.APPROVED;

    return {
      id: userDto.id,
      name: `${userDto.firstName} ${userDto.lastName || ''}`.trim(),
      role: mappedRole,
      roleName: userDto.roleName || null,
      organisationName: userDto.organisationName || null,
      status: mappedStatus,
      mode: 'session',
    };
  },
};
