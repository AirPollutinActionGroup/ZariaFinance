export const ROLES = [
  'Administrator',
  'Finance Manager',
  'Fundraise Lead',
  'Programme Manager',
  'Auditor',
  'Viewer',
] as const;

export type Role = (typeof ROLES)[number];

export interface RegisterValues {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  username: string;
  role: Role | '';
  password: string;
  confirmPassword: string;
}

export interface LoginValues {
  email: string;
  password: string;
  remember: boolean;
}

export const EMPTY_REGISTER: RegisterValues = {
  firstName: '', lastName: '', email: '', mobile: '',
  username: '', role: '', password: '', confirmPassword: '',
};

export const EMPTY_LOGIN: LoginValues = { email: '', password: '', remember: false };

export type Errors<T> = Partial<Record<keyof T, string>>;