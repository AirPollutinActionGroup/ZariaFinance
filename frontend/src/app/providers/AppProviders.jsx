import { useState } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { theme } from '../../theme/theme.js';
import { createQueryClient } from '../../lib/query/queryClient.js';
import { AuthProvider } from '../../core/auth/index.js';
import { env } from '../../lib/config/env.js';

/** Composition of all cross-cutting providers, outermost first. */
export function AppProviders({ children }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
        {env.isDev ? <ReactQueryDevtools initialIsOpen={false} /> : null}
      </QueryClientProvider>
    </ThemeProvider>
  );
}
