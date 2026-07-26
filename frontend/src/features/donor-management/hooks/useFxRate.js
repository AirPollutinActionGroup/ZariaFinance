import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { fxRateApi } from '../api/fxRateApi.js';

/**
 * Reference rate to INR for a currency on a date, used to auto-fill the grant
 * agreement's locked FX rate. Skipped for INR (always 1) and until a date is
 * chosen. Rates for a past date never change, so they stay fresh indefinitely.
 */
export function useFxRate(currency, date) {
  const enabled = Boolean(currency) && currency !== 'INR' && Boolean(date);
  return useQuery({
    queryKey: queryKeys.fxRates.lookup(currency, date),
    queryFn: () => fxRateApi.get(currency, date),
    enabled,
    staleTime: Infinity,
  });
}
