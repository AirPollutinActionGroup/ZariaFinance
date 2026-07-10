import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { createAppTheme } from './theme.js';

const STORAGE_KEY = 'zariya.theme.v1';

const ColorModeContext = createContext({ mode: 'light', toggleColorMode: () => {} });

/** Access the current colour mode and a toggle (used by the top bar). */
export const useColorMode = () => useContext(ColorModeContext);

function resolveInitialMode() {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    /* localStorage may be unavailable (private mode) — fall through */
  }
  const prefersDark =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

/**
 * Provides the MUI theme for the active colour mode, keeps the
 * `data-theme` attribute on <html> in sync (so the CSS custom properties in
 * styles/theme.css follow), and persists the choice.
 */
export function ColorModeProvider({ children }) {
  const [mode, setMode] = useState(resolveInitialMode);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* ignore persistence failures */
    }
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      toggleColorMode: () => setMode((m) => (m === 'light' ? 'dark' : 'light')),
    }),
    [mode],
  );

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}
