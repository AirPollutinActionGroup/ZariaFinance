import type { RegisterValues, LoginValues, Errors } from '@/types/auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[\d\s-]{7,16}$/;

export function validateRegister(v: RegisterValues): Errors<RegisterValues> {
  const e: Errors<RegisterValues> = {};
  if (!v.firstName.trim()) e.firstName = 'First name is required.';
  if (!v.lastName.trim()) e.lastName = 'Last name is required.';
  if (!v.email.trim()) e.email = 'Email is required.';
  else if (!EMAIL_RE.test(v.email)) e.email = 'Enter a valid email address.';
  if (!v.mobile.trim()) e.mobile = 'Mobile number is required.';
  else if (!PHONE_RE.test(v.mobile)) e.mobile = 'Enter a valid mobile number.';
  if (!v.username.trim()) e.username = 'Username is required.';
  else if (v.username.trim().length < 3) e.username = 'At least 3 characters.';
  if (!v.role) e.role = 'Select a role.';
  if (!v.password) e.password = 'Password is required.';
  else if (v.password.length < 8) e.password = 'At least 8 characters.';
  if (!v.confirmPassword) e.confirmPassword = 'Please confirm your password.';
  else if (v.confirmPassword !== v.password) e.confirmPassword = 'Passwords do not match.';
  return e;
}

export function validateLogin(v: LoginValues): Errors<LoginValues> {
  const e: Errors<LoginValues> = {};
  if (!v.email.trim()) e.email = 'Email is required.';
  else if (!EMAIL_RE.test(v.email)) e.email = 'Enter a valid email address.';
  if (!v.password) e.password = 'Password is required.';
  return e;
}

export function hasErrors<T>(e: Errors<T>): boolean {
  return Object.keys(e).length > 0;
}
