import { usePermission } from './usePermission.js';

/**
 * Renders children only when the current user may perform `action`
 * on `moduleId`. Keeps permission checks out of page markup.
 *
 *   <PermissionGate action={ACTIONS.EDIT} moduleId="donor-management">
 *     <Button>New donor</Button>
 *   </PermissionGate>
 */
export function PermissionGate({ action, moduleId, fallback = null, children }) {
  const { allowed } = usePermission(action, moduleId);
  return allowed ? children : fallback;
}
