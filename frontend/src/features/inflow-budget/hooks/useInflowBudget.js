import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { inflowBudgetService } from '../services/inflowBudgetService.js';

export function useInflowBudgetLines() {
  return useQuery({
    queryKey: queryKeys.inflowBudgetLines.all(),
    queryFn: () => inflowBudgetService.listLines(),
  });
}

export function useInflowBudgetLine(id) {
  return useQuery({
    queryKey: queryKeys.inflowBudgetLines.detail(id),
    queryFn: () => inflowBudgetService.getLine(id),
    enabled: id != null,
  });
}
