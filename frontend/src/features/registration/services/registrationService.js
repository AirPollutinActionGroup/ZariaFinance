import { userRegisterApi } from '../api/userRegisterApi.js';

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
};
