/**
 * Declarative permission model for Zariya.
 *
 * Roles and their capabilities come from the approved access model
 * (project scope §6.3 + platform brief). The policy is data, not code:
 * adding a role or module means editing this table only (Open/Closed).
 *
 * Backend note: the users table currently stores role as a free string
 * (default "USER") — see docs/BACKEND_GAPS.md #3. The role names below are
 * the agreed contract for when backend authorisation lands.
 */

export const ROLES = Object.freeze({
  CEO: 'CEO',
  FINANCE_OFFICER: 'FINANCE_OFFICER',
  FUNDRAISING_LEAD: 'FUNDRAISING_LEAD',
});

export const ACTIONS = Object.freeze({
  VIEW: 'view',
  EDIT: 'edit',
  COMMENT: 'comment',
  APPROVE: 'approve',
});

export const USER_STATUS = Object.freeze({
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
  DISABLED: 'DISABLED',
});

/** Wildcard meaning "every module, including modules added later". */
export const ALL_MODULES = '*';

/**
 * The policy table. Key: role → module (or ALL_MODULES) → Set of actions.
 *
 *  - CEO: view + comment everywhere (governance oversight, no data entry).
 *  - Accounts / Finance Officer: view + edit + comment everywhere, and the
 *    operational approver for record lifecycles (grant approve/close).
 *  - Fund Raising Lead: view + edit + comment inside Donor Management only.
 */
const POLICY = Object.freeze({
  [ROLES.CEO]: {
    [ALL_MODULES]: new Set([ACTIONS.VIEW, ACTIONS.COMMENT]),
  },
  [ROLES.FINANCE_OFFICER]: {
    [ALL_MODULES]: new Set([ACTIONS.VIEW, ACTIONS.EDIT, ACTIONS.COMMENT, ACTIONS.APPROVE]),
  },
  [ROLES.FUNDRAISING_LEAD]: {
    'donor-management': new Set([ACTIONS.VIEW, ACTIONS.EDIT, ACTIONS.COMMENT]),
  },
});

/**
 * Pure permission check.
 * @param {{role: string, status: string}|null} user
 * @param {string} action  One of ACTIONS.
 * @param {string} moduleId Module identifier, e.g. 'donor-management'.
 * @returns {boolean}
 */
export function can(user, action, moduleId) {
  if (!user || user.status !== USER_STATUS.APPROVED) return false;
  const rolePolicy = POLICY[user.role];
  if (!rolePolicy) return false;
  const moduleActions = rolePolicy[moduleId] || rolePolicy[ALL_MODULES];
  if (!moduleActions) return false;
  return moduleActions.has(action);
}

/** Convenience: modules the user may see at all (drives navigation). */
export function canViewModule(user, moduleId) {
  return can(user, ACTIONS.VIEW, moduleId);
}
