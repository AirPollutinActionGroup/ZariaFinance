import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { outflowApi } from '../api/outflowApi.js';
import { fromOutflowRowResponse } from '../mappers/outflowMapper.js';

/** Outflow rows of every approved budget (optionally one financial year). */
export function useOutflowRows(financialYear) {
  return useQuery({
    queryKey: queryKeys.outflow.list(financialYear),
    queryFn: async () => (await outflowApi.list(financialYear)).map(fromOutflowRowResponse),
  });
}

export function useOutflowRow(rowId) {
  return useQuery({
    queryKey: queryKeys.outflow.detail(rowId),
    queryFn: async () => fromOutflowRowResponse(await outflowApi.getById(rowId)),
    enabled: Boolean(rowId),
  });
}
