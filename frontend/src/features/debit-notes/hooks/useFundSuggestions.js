import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { fundSuggestionApi } from '../api/fundSuggestionApi.js';

const toNumber = (v) => (v == null ? null : Number(v));

/** FundSuggestionResponse → view model (money fields as numbers). */
function fromFundSuggestion(dto) {
  return {
    ...dto,
    grantTotal: toNumber(dto.grantTotal),
    received: Number(dto.received) || 0,
    debited: Number(dto.debited) || 0,
    available: Number(dto.available) || 0,
    availableAfter: toNumber(dto.availableAfter),
    utilisationAfterPct: toNumber(dto.utilisationAfterPct),
    reasons: dto.reasons || [],
    warnings: dto.warnings || [],
  };
}

/**
 * Top funds a debit note on this outflow row could be charged to. Only fetched
 * while `enabled` (the suggestions dialog is open), and always fresh — balances
 * change with every note.
 */
export function useFundSuggestions({ outflowLineId, amount, date, book, limit = 10 }, { enabled = true } = {}) {
  const params = { outflowLineId, amount: amount > 0 ? amount : undefined, date: date || undefined, book: book || undefined, limit };
  return useQuery({
    queryKey: queryKeys.debitNotes.fundSuggestions(params),
    queryFn: async () => (await fundSuggestionApi.forDebitNote(params)).map(fromFundSuggestion),
    enabled: enabled && Boolean(outflowLineId),
    staleTime: 0,
  });
}
