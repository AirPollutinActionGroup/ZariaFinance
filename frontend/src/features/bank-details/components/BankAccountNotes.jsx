import { Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DataTable, StatusChip } from '../../../shared/components/index.js';
import { formatInrExact } from '../../../lib/format/currency.js';
import { formatDate } from '../../../lib/format/date.js';
import { useDebitNotes } from '../../debit-notes/hooks/useDebitNotes.js';
import { useCreditNotes } from '../../credit-notes/hooks/useCreditNotes.js';

const sameId = (a, b) => a != null && b != null && String(a) === String(b);

function Total({ label, value, color }) {
  return (
    <Grid size={{ xs: 12, sm: 4 }}>
      <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'var(--card2)' }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{value}</Typography>
      </Box>
    </Grid>
  );
}

/**
 * Debit notes paid from, and credit notes received into, one bank account.
 * Notes keep the account they were raised with as a { id, name } snapshot.
 */
export function BankAccountNotes({ bankAccountId }) {
  const navigate = useNavigate();
  const debitNotesQuery = useDebitNotes();
  const creditNotesQuery = useCreditNotes();

  const onThisAccount = (n) => sameId(n.bankAccount?.id, bankAccountId);
  const debits = (debitNotesQuery.data || []).filter(onThisAccount);
  const credits = (creditNotesQuery.data || []).filter(onThisAccount);
  const rows = [
    ...debits.map((n) => ({ ...n, kind: 'DEBIT', party: n.payee?.name })),
    ...credits.map((n) => ({ ...n, kind: 'CREDIT', party: n.donor?.name })),
  ];
  const sum = (list) => list.reduce((s, n) => s + n.amount, 0);
  const paidOut = sum(debits);
  const receivedIn = sum(credits);
  const net = receivedIn - paidOut;

  const queries = [debitNotesQuery, creditNotesQuery];
  const failed = queries.find((q) => q.isError);

  const columns = [
    {
      key: 'id',
      header: 'Note',
      sortValue: (n) => n.date,
      render: (n) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 12.5 }}>{n.id}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{formatDate(n.date)}</Typography>
        </Box>
      ),
    },
    {
      key: 'kind',
      header: 'Type',
      sortValue: (n) => n.kind,
      render: (n) => (
        <StatusChip label={n.kind === 'DEBIT' ? 'Debit note' : 'Credit note'} tone={n.kind === 'DEBIT' ? 'error' : 'success'} />
      ),
    },
    {
      key: 'party',
      header: 'Paid to / received from',
      sortValue: (n) => n.party || null,
      render: (n) => (
        <Box>
          <Typography variant="body2">{n.party || '—'}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            {[n.paymentMode?.name, n.reference].filter(Boolean).join(' · ')}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'fund',
      header: 'Fund & Grant',
      sortValue: (n) => n.fundProfile?.name || null,
      render: (n) =>
        n.fundProfile ? (
          <Box>
            <Typography variant="body2">{n.fundProfile.name}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
              {[n.donor?.name, n.grant?.name].filter(Boolean).join(' · ')}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">—</Typography>
        ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      sortValue: (n) => (n.kind === 'DEBIT' ? -n.amount : n.amount),
      render: (n) => (
        <Typography
          variant="body2"
          sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: n.kind === 'DEBIT' ? 'error.main' : 'success.main' }}
        >
          {n.kind === 'DEBIT' ? '−' : '+'} {formatInrExact(n.amount)}
        </Typography>
      ),
    },
  ];

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
      <CardContent sx={{ p: 3.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Debit &amp; credit notes</Typography>
          <Typography variant="caption" color="text.secondary">
            {debits.length} debit · {credits.length} credit
          </Typography>
        </Stack>

        <Grid container spacing={2} sx={{ mb: 2.5 }}>
          <Total label="Paid out (debit notes)" value={formatInrExact(paidOut)} color="error.main" />
          <Total label="Received in (credit notes)" value={formatInrExact(receivedIn)} color="success.main" />
          <Total
            label="Net"
            value={`${net < 0 ? '−' : ''}${formatInrExact(Math.abs(net))}`}
            color={net < 0 ? 'error.main' : 'text.primary'}
          />
        </Grid>

        <DataTable
          columns={columns}
          rows={rows}
          getRowKey={(n) => n.id}
          isLoading={queries.some((q) => q.isPending)}
          error={failed ? failed.error : null}
          onRetry={() => queries.forEach((q) => q.isError && q.refetch())}
          defaultSort={{ key: 'id', direction: 'desc' }}
          onRowClick={(n) => navigate(`/${n.kind === 'DEBIT' ? 'debit' : 'credit'}-notes/${n.id}`)}
          emptyTitle="No notes on this account yet"
          emptyDescription="Debit notes paid from this account and credit notes received into it show up here."
        />
      </CardContent>
    </Card>
  );
}
