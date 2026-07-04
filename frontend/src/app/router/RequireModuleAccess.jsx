import { useAuth } from '../../core/auth/index.js';
import { ACTIONS, can } from '../../core/permissions/index.js';
import { NotFoundPage } from '../../features/auth-pages/NotFoundPage.jsx';

/**
 * Route-level authorisation: a module's routes render only when the user
 * holds VIEW on that module; otherwise a 404 is shown (not a 403 — route
 * existence is not leaked to unauthorised roles).
 */
export function RequireModuleAccess({ moduleId, children }) {
  const { user } = useAuth();
  if (!can(user, ACTIONS.VIEW, moduleId)) return <NotFoundPage />;
  return children;
}
