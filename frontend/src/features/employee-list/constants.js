export const MODULE_ID = 'employee-list';

/** Employee lifecycle status values — must match EmployeeStatuses.java verbatim. */
export const EMPLOYEE_STATUSES = [
  'Active',
  'On Notice',
  'Inactive – Resigned',
  'Inactive – Terminated',
  'Inactive – Contract Ended',
];

/** Chip colour per status — anything not Active/On Notice reads as inactive. */
export const EMPLOYEE_STATUS_TONE = {
  Active: 'success',
  'On Notice': 'warning',
  'Inactive – Resigned': 'error',
  'Inactive – Terminated': 'error',
  'Inactive – Contract Ended': 'error',
};
