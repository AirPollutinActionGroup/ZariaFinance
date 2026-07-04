/**
 * Persistence for the client-side session descriptor (NOT credentials —
 * the backend session itself is a Spring Security cookie). Only the
 * user descriptor {name, role, status, mode} is stored, so a refresh
 * keeps the operator signed in to the shell.
 */

const STORAGE_KEY = 'zariya.session.v1';

export function readStoredSession() {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeStoredSession(session) {
  try {
    if (session) {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Storage unavailable (private mode etc.) — session lives in memory only.
  }
}
