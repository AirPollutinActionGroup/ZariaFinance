import { userRegisterApi } from '../api/userRegisterApi.js';
import { userRegisterNewApi } from '../api/userRegisterNewApi.js';

/**
 * Registration service. Maps form values → AddUserRegisterDto verbatim
 * (field names owned by the backend: emailId, mobileNo, username…).
 */
export const registrationService = {
  async register(values) {
    const dto = {
      firstName: values.firstName.trim(),
      lastName: values.lastName?.trim() || null,
      emailId: values.emailId.trim(),
      mobileNo: values.mobileNo.trim(),
      username: values.username.trim(),
      password: values.password,
    };
    return userRegisterApi.register(dto);
  },

  /**
   * Extended registration (register-extended) — same account fields plus
   * the applicant's selected Role Directory role and Organisation, posted
   * to the dedicated userRegisterNew endpoint (CreateUserRegisterRequest).
   */
  async registerExtended(values) {
    const dto = {
      firstName: values.firstName.trim(),
      lastName: values.lastName?.trim() || null,
      emailId: values.emailId.trim(),
      mobileNo: values.mobileNo.trim(),
      username: values.username.trim(),
      password: values.password,
      roleId: Number(values.role),
      organisationId: Number(values.organisation),
    };
    return userRegisterNewApi.register(dto);
  },

  /** Resolves true when username is not already registered (extended flow). */
  async isUsernameAvailable(username) {
    const { exists } = await userRegisterNewApi.verifyUsername(username);
    return !exists;
  },
};
