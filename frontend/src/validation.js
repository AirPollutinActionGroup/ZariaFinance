import { PASSWORD_MIN_LENGTH } from "./constants";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_PATTERN = /^\d{10,15}$/;

function isBlank(value) {
  return !value || !String(value).trim();
}

export function validateSignIn(values) {
  const errors = {};

  if (isBlank(values.username)) {
    errors.username = "Username is required.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  }

  return errors;
}

export function validateSignUp(values) {
  const errors = {};

  const requiredFields = [
    ["firstName", "First name is required."],
    ["lastName", "Last name is required."],
    ["email", "Email is required."],
    ["mobile", "Mobile number is required."],
    ["username", "Username is required."],
    ["role", "Role is required."],
    ["password", "Password is required."],
    ["confirmPassword", "Confirm password is required."]
  ];

  requiredFields.forEach(([field, message]) => {
    if (isBlank(values[field])) {
      errors[field] = message;
    }
  });

  if (!errors.email && !EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!errors.mobile && !MOBILE_PATTERN.test(values.mobile.replace(/[\s-]+/g, ""))) {
    errors.mobile = "Enter a valid mobile number (10-15 digits).";
  }

  if (!errors.username && values.username.trim().length < 3) {
    errors.username = "Username must be at least 3 characters.";
  }

  if (!errors.password && values.password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  }

  if (!errors.confirmPassword && values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}
