import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { env } from '../../lib/config/env.js';
import { USER_STATUS } from '../permissions/permissions.js';
import { authRepository } from './authRepository.js';
import { readStoredSession, writeStoredSession } from './sessionStorage.js';

/**
 * Session state for the application.
 *
 * user shape: { name, role, status, mode: 'session' | 'review' } | null
 *
 * 'review' mode is an explicit, visibly-labelled stopgap while the backend
 * login endpoint is missing (docs/BACKEND_GAPS.md #1). It grants the role
 * configured via VITE_REVIEW_MODE_ROLE and is rendered with a banner chip
 * in the top bar so it can never be mistaken for a real authenticated user.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredSession());

  const login = useCallback(async (credentials) => {
    // Rejects until the backend exposes a login endpoint; the page surfaces it.
    const session = await authRepository.login(credentials);
    setUser(session);
    writeStoredSession(session);
    return session;
  }, []);

  const enterReviewMode = useCallback(() => {
    const session = {
      name: 'Review Mode',
      role: env.reviewModeRole,
      status: USER_STATUS.APPROVED,
      mode: 'review',
    };
    setUser(session);
    writeStoredSession(session);
    return session;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    writeStoredSession(null);
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, enterReviewMode, logout }),
    [user, login, enterReviewMode, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
