import { QueryClient } from '@tanstack/react-query';

/**
 * Application-wide TanStack Query client.
 *
 * Defaults are conservative for a finance system: data is considered fresh
 * for 30s, retries are limited and never performed for client errors
 * (4xx responses will not change on retry).
 */
export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error?.status >= 400 && error?.status < 500) return false;
          return failureCount < 2;
        },
      },
      mutations: {
        retry: false,
      },
    },
  });
}
