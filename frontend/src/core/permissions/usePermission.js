import { useCallback } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { can } from './permissions.js';

/**
 * Hook binding the pure permission engine to the current session.
 * Usage: const { allowed } = usePermission(ACTIONS.EDIT, 'donor-management');
 */
export function usePermission(action, moduleId) {
  const { user } = useAuth();
  return { allowed: can(user, action, moduleId) };
}

/** Curried checker for components that gate several actions at once. */
export function usePermissionChecker(moduleId) {
  const { user } = useAuth();
  return useCallback((action) => can(user, action, moduleId), [user, moduleId]);
}
