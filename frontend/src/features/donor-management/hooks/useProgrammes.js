import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { programmeApi } from '../api/programmeApi.js';

export function useProgrammes() {
  return useQuery({
    queryKey: queryKeys.programmes.all(),
    queryFn: () => programmeApi.list(),
  });
}
