import { describe, expect, it } from 'vitest';
import { ACTIONS, ROLES, USER_STATUS, can, canViewModule } from './permissions.js';

const approved = (role) => ({ role, status: USER_STATUS.APPROVED });

describe('permission engine', () => {
  it('denies everything for anonymous users', () => {
    expect(can(null, ACTIONS.VIEW, 'donor-management')).toBe(false);
  });

  it('denies access for accounts that are not approved', () => {
    for (const status of [
      USER_STATUS.PENDING_APPROVAL,
      USER_STATUS.REJECTED,
      USER_STATUS.SUSPENDED,
      USER_STATUS.DISABLED,
    ]) {
      expect(can({ role: ROLES.FINANCE_OFFICER, status }, ACTIONS.VIEW, 'dashboard')).toBe(false);
    }
  });

  it('CEO can view and comment everywhere but never edit or approve', () => {
    const ceo = approved(ROLES.CEO);
    expect(can(ceo, ACTIONS.VIEW, 'donor-management')).toBe(true);
    expect(can(ceo, ACTIONS.COMMENT, 'dashboard')).toBe(true);
    expect(can(ceo, ACTIONS.VIEW, 'a-future-module')).toBe(true);
    expect(can(ceo, ACTIONS.EDIT, 'donor-management')).toBe(false);
    expect(can(ceo, ACTIONS.APPROVE, 'donor-management')).toBe(false);
  });

  it('finance officer can view, edit, comment and approve everywhere', () => {
    const officer = approved(ROLES.FINANCE_OFFICER);
    for (const action of Object.values(ACTIONS)) {
      expect(can(officer, action, 'donor-management')).toBe(true);
      expect(can(officer, action, 'dashboard')).toBe(true);
    }
  });

  it('fundraising lead is scoped to donor management only', () => {
    const lead = approved(ROLES.FUNDRAISING_LEAD);
    expect(can(lead, ACTIONS.VIEW, 'donor-management')).toBe(true);
    expect(can(lead, ACTIONS.EDIT, 'donor-management')).toBe(true);
    expect(can(lead, ACTIONS.COMMENT, 'donor-management')).toBe(true);
    expect(can(lead, ACTIONS.APPROVE, 'donor-management')).toBe(false);
    expect(canViewModule(lead, 'dashboard')).toBe(false);
    expect(can(lead, ACTIONS.VIEW, 'reports')).toBe(false);
  });

  it('unknown roles get nothing', () => {
    expect(can(approved('MYSTERY'), ACTIONS.VIEW, 'dashboard')).toBe(false);
  });
});
