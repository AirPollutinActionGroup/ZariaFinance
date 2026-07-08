export const AUTH_MODES = {
  SIGN_IN: "signIn",
  SIGN_UP: "signUp"
};

export const ROLE_OPTIONS = [
  { value: "donor-manager", label: "Donor Manager" },
  { value: "finance-lead", label: "Finance Lead" },
  { value: "admin", label: "Admin" }
];

export const SIGN_IN_INITIAL_VALUES = {
  username: "",
  password: "",
  rememberMe: false
};

export const SIGN_UP_INITIAL_VALUES = {
  firstName: "",
  lastName: "",
  email: "",
  mobile: "",
  username: "",
  role: "",
  password: "",
  confirmPassword: ""
};

export const PASSWORD_MIN_LENGTH = 8;
