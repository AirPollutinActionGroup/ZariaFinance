import { useMemo } from 'react';
import { useAllFundProfiles, useFundProfile } from '../../donor-management/hooks/useFundProfiles.js';
import { useGrantByFundProfileId, useGrants } from '../../donor-management/hooks/useGrants.js';
import { useInflowBudgetLines } from '../../inflow-budget/hooks/useInflowBudget.js';
import { useDebitNotes } from '../../debit-notes/hooks/useDebitNotes.js';
import { useCreditNotes } from '../../credit-notes/hooks/useCreditNotes.js';
import { buildFundingRecords } from '../lib/fundingRecords.js';

/**
 * Every funding record (fund profile + its grant agreement) — reads the two
 * existing endpoints and joins them client-side. No backend changes.
 */
export function useFundingRecords() {
  const profilesQuery = useAllFundProfiles();
  const grantsQuery = useGrants({});

  const records = useMemo(
    () => buildFundingRecords(profilesQuery.data || [], grantsQuery.data || []),
    [profilesQuery.data, grantsQuery.data],
  );

  const queries = [profilesQuery, grantsQuery];
  const failed = queries.find((q) => q.isError);
  return {
    records,
    isPending: queries.some((q) => q.isPending),
    error: failed ? failed.error : null,
    refetch: () => queries.forEach((q) => q.isError && q.refetch()),
  };
}

/** One funding record, keyed by fund profile id. `grant` is null until an agreement exists. */
export function useFundingRecord(profileId) {
  const profileQuery = useFundProfile(profileId);
  const grantQuery = useGrantByFundProfileId(profileId);
  return {
    profile: profileQuery.data || null,
    grant: grantQuery.data || null,
    profileQuery,
    grantQuery,
  };
}

/**
 * Money that has moved against a grant: received (inflow-budget actuals on the
 * profile's tranches), spent (debit notes) and the combined note ledger.
 * Same rules as GrantDetailPage, so both views always agree.
 */
export function useFundingMoney(grant, profile) {
  const inflowLinesQuery = useInflowBudgetLines();
  const debitNotesQuery = useDebitNotes();
  const creditNotesQuery = useCreditNotes();

  const sameId = (a, b) => a != null && b != null && String(a) === String(b);
  const onThisGrant = (n) =>
    grant != null &&
    (sameId(n.grant?.id, grant.id) || (!n.grant && sameId(n.fundProfile?.id, grant.fundProfileId ?? profile?.id)));

  const noteRows = (notes, type) =>
    (notes || []).filter(onThisGrant).map((n) => ({
      id: n.id,
      type,
      date: n.date,
      amount: n.amount,
      partyName: type === 'DEBIT' ? n.payee?.name || '—' : n.donor?.name || '—',
      paymentModeLabel: n.paymentMode?.name || '—',
      reference: n.reference,
      href: `/${type === 'DEBIT' ? 'debit' : 'credit'}-notes/${n.id}`,
    }));

  const transactions = [
    ...noteRows(debitNotesQuery.data, 'DEBIT'),
    ...noteRows(creditNotesQuery.data, 'CREDIT'),
  ].sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')));

  const trancheIds = new Set(
    (profile?.disbursementRules || []).flatMap((r) => (r.trancheCriteria || []).map((t) => String(t.id))),
  );
  const received = (inflowLinesQuery.data || [])
    .filter((line) => trancheIds.has(String(line.id)))
    .reduce((sum, line) => sum + (Number(line.actualAmount) || 0), 0);
  const spent = transactions
    .filter((t) => t.type === 'DEBIT')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const queries = [debitNotesQuery, creditNotesQuery, inflowLinesQuery];
  const failed = queries.find((q) => q.isError);
  return {
    transactions,
    received,
    spent,
    isLoading: queries.some((q) => q.isPending),
    error: failed ? failed.error : null,
    retry: () => queries.forEach((q) => q.isError && q.refetch()),
  };
}
