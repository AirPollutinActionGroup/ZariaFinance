import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import { USER_STATUS } from '../permissions/permissions.js';

/**
 * Route guard: unauthenticated users are sent to /login; authenticated but
 * not-yet-approved users are parked on the pending-approval screen, matching
 * the governance rule that new accounts activate only after manual approval.
 */
export function RequireAuth() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (user.status !== USER_STATUS.APPROVED) {
    return <Navigate to="/pending-approval" replace />;
  }
  return <Outlet />;
}
