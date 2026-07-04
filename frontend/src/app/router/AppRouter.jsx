import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { RequireAuth } from '../../core/auth/index.js';
import { getModuleRoutes } from '../../core/modules/index.js';
import { AppShell } from '../layout/AppShell.jsx';
import { LoginPage } from '../../features/auth-pages/LoginPage.jsx';
import { PendingApprovalPage } from '../../features/auth-pages/PendingApprovalPage.jsx';
import { NotFoundPage } from '../../features/auth-pages/NotFoundPage.jsx';
import { RegisterPage } from '../../features/registration/pages/RegisterPage.jsx';
import { HomeRedirect } from './HomeRedirect.jsx';
import { RequireModuleAccess } from './RequireModuleAccess.jsx';

/**
 * Route tree. Module routes are composed from the registry — the router
 * never references individual business features.
 */
export function AppRouter() {
  const moduleRoutes = getModuleRoutes();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/pending-approval" element={<PendingApprovalPage />} />

        <Route element={<RequireAuth />}>
          <Route element={<AppShell />}>
            <Route index element={<HomeRedirect />} />
            {moduleRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={
                  <RequireModuleAccess moduleId={route.moduleId}>
                    {route.element}
                  </RequireModuleAccess>
                }
              />
            ))}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
