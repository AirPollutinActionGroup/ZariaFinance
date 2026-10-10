import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { debitNoteApi } from '../api/debitNoteApi.js';
import { fromNoteResponse, toCreateNoteRequest } from '../mappers/noteMapper.js';
import { fromSuggestionResponse } from '../mappers/suggestionMapper.js';

export function useDebitNotes() {
  return useQuery({
    queryKey: queryKeys.debitNotes.list(),
    queryFn: async () => (await debitNoteApi.list()).map(fromNoteResponse),
  });
}

export function useDebitNote(code) {
  return useQuery({
    queryKey: queryKeys.debitNotes.detail(code),
    queryFn: async () => fromNoteResponse(await debitNoteApi.getByCode(code)),
    enabled: Boolean(code),
  });
}

/**
 * Donor funds suggested for a note on an outflow row — fetched only while
 * `enabled` (the suggestion dialog is open). Kept under debitNotes, so issuing
 * a note (which changes fund balances) refreshes it.
 */
export function useDebitNoteSuggestions({ outflowLineId, amount, date, book }, { enabled = true } = {}) {
  const params = { outflowLineId, amount: amount > 0 ? amount : null, date: date || null, book: book || null };
  return useQuery({
    queryKey: queryKeys.debitNotes.suggestions(params),
    queryFn: async () => fromSuggestionResponse(await debitNoteApi.suggestions(params)),
    enabled: enabled && Boolean(outflowLineId),
    staleTime: 0,
  });
}

/** A debit note changes the outflow row's Spent — refresh notes and the schedule. */
function useInvalidateNotesAndOutflow() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.debitNotes.all() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.creditNotes.all() }),
      queryClient.invalidateQueries({ queryKey: queryKeys.outflow.all() }),
    ]);
}

export function useCreateDebitNote() {
  const invalidate = useInvalidateNotesAndOutflow();
  return useMutation({
    mutationFn: async ({ input, actor }) => fromNoteResponse(await debitNoteApi.create(toCreateNoteRequest(input, { actor }))),
    onSuccess: invalidate,
  });
}
