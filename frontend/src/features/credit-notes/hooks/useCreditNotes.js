import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { creditNoteApi } from '../api/creditNoteApi.js';
import { fromNoteResponse, toCreateNoteRequest } from '../../debit-notes/mappers/noteMapper.js';

export function useCreditNotes() {
  return useQuery({
    queryKey: queryKeys.creditNotes.list(),
    queryFn: async () => (await creditNoteApi.list()).map(fromNoteResponse),
  });
}

export function useCreditNote(code) {
  return useQuery({
    queryKey: queryKeys.creditNotes.detail(code),
    queryFn: async () => fromNoteResponse(await creditNoteApi.getByCode(code)),
    enabled: Boolean(code),
  });
}

/** A credit note changes the outflow row's Spent (and what's left of a debit note) — refresh all three. */
function useInvalidateNotesAndOutflow() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.creditNotes.all() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.debitNotes.all() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.outflow.all() }),
    ]);
}

export function useCreateCreditNote() {
  const invalidate = useInvalidateNotesAndOutflow();
  return useMutation({
    mutationFn: async ({ input, actor }) => fromNoteResponse(await creditNoteApi.create(toCreateNoteRequest(input, { actor }))),
    onSuccess: invalidate,
  });
}
