import { Box, Button, Stack, Typography } from '@mui/material';
import { DataTable, StatusChip } from '../../../shared/components/index.js';
import { ACTIONS, PermissionGate } from '../../../core/permissions/index.js';
import { formatDate } from '../../../lib/format/date.js';
import { useReceiveTranche, useTranchesByGrant } from '../hooks/useTranches.js';
import { MODULE_ID } from '../constants.js';

const STATUS_TONE = { Received: 'success', Expected: 'neutral', Pending: 'warning' };

function money(currency, amount) {
  if (amount == null) return '—';
  const n = Number(amount).toLocaleString('en-IN');
  return currency && currency !== 'INR' ? `${currency} ${n}` : `₹${n}`;
}

/** Tranche schedule + receipts for a grant, with a one-click "record receipt". */
export function TranchesPanel({ grantId, grantCurrency }) {
  const query = useTranchesByGrant(grantId);
  const receive = useReceiveTranche(grantId);

  const markReceived = (tranche) => {
    receive.mutate({
      trancheId: tranche.id,
      payload: {
        actualAmount: tranche.trancheAmount,
        actualDate: new Date().toISOString().slice(0, 10),
      },
    });
  };

  const columns = [
    { key: 'trancheNumber', header: '#', width: 50, render: (r) => `T${r.trancheNumber}` },
    { key: 'trancheAmount', header: 'Expected', align: 'right', render: (r) => money(grantCurrency, r.trancheAmount) },
    { key: 'plannedReleaseDate', header: 'Planned', render: (r) => formatDate(r.plannedReleaseDate) },
    { key: 'actualAmount', header: 'Actual', align: 'right', render: (r) => money(grantCurrency, r.actualAmount) },
    { key: 'actualReleaseDate', header: 'Received on', render: (r) => formatDate(r.actualReleaseDate) },
    {
      key: 'trancheStatus',
      header: 'Status',
      render: (r) => <StatusChip label={r.trancheStatus} tone={STATUS_TONE[r.trancheStatus] || 'neutral'} />,
    },
    { key: 'conditionMet', header: 'Gate', render: (r) => r.conditionMet || '—' },
    {
      key: 'action',
      header: '',
      align: 'right',
      render: (r) =>
        r.trancheStatus !== 'Received' ? (
          <PermissionGate action={ACTIONS.EDIT} moduleId={MODULE_ID}>
            <Button size="small" onClick={() => markReceived(r)} disabled={receive.isPending}>
              Record receipt
            </Button>
          </PermissionGate>
        ) : null,
    },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h2" sx={{ mb: 1.5 }}>
        Tranches
      </Typography>
      <Stack spacing={1}>
        <DataTable
          columns={columns}
          rows={query.data || []}
          getRowKey={(r) => r.id}
          isLoading={query.isPending}
          error={query.isError ? query.error : null}
          onRetry={query.refetch}
          emptyTitle="No tranches scheduled"
          emptyDescription="Scheduled receipts appear here; recording an actual receipt feeds the funding chain."
        />
        <Typography variant="caption" color="text.secondary">
          Amounts are in the grant currency. Recording a receipt updates the dashboard funding chain.
        </Typography>
      </Stack>
    </Box>
  );
}
