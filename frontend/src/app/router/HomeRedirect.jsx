import { Navigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/index.js';
import { canViewModule } from '../../core/permissions/index.js';
import { getNavSections } from '../../core/modules/index.js';

/** Sends the user to the first module they are allowed to see. */
export function HomeRedirect() {
  const { user } = useAuth();
  const sections = getNavSections(user, canViewModule);
  const firstItem = sections[0]?.items[0];
  return <Navigate to={firstItem ? firstItem.path : '/login'} replace />;
}
