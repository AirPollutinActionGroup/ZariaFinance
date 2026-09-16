import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { transactionService } from '../services/transactionService.js';

export function useTransactions() {
  return useQuery({
    queryKey: queryKeys.transactions.all(),
    queryFn: () => transactionService.listTransactions(),
  });
}

export function useTransaction(transactionCode) {
  return useQuery({
    queryKey: queryKeys.transactions.detail(transactionCode),
    queryFn: () => transactionService.getTransaction(transactionCode),
    enabled: transactionCode != null,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formValues) => transactionService.createTransaction(formValues),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all() }),
  });
}
