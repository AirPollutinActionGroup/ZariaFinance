import { Box, Button, Stack, Typography } from '@mui/material';
import { DataTable, StatusChip } from '../../../shared/components/index.js';
import { ACTIONS, PermissionGate } from '../../../core/permissions/index.js';
import { formatDate } from '../../../lib/format/date.js';
import { useReceiveTranche, useTranchesByGrant } from '../hooks/useTranches.js';
import { MODULE_ID } from '../constants.js';

const STATUS_TONE = { Received: 'success', Expected: 'warning', Pending: 'warning' };

function money(currency, amount) {
  if (amount == null) return '—';
  const n = Number(amount).toLocaleString('en-IN');
  return currency && currency !== 'INR' ? `${currency} ${n}` : `₹${n}`;
}

/** Tranche schedule + receipts for a grant, in the approved design's table layout. */
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
    { key: 'trancheNumber', header: '#', width: 50 },
    { key: 'trancheAmount', header: 'Expected', align: 'right', render: (r) => money(grantCurrency, r.trancheAmount) },
    { key: 'plannedReleaseDate', header: 'Expected date', render: (r) => formatDate(r.plannedReleaseDate) },
    { key: 'actualAmount', header: 'Received', align: 'right', render: (r) => money(grantCurrency, r.actualAmount) },
    { key: 'actualReleaseDate', header: 'Received date', render: (r) => formatDate(r.actualReleaseDate) },
    // Tranche-on-UC funding cycle (issue #21, item 13): amount utilised up to the
    // end of this tranche's period — the basis for the tranche Utilisation Certificate.
    { key: 'utilisedAmount', header: 'Utilised', align: 'right', render: (r) => money(grantCurrency, r.utilisedAmount) },
    { key: 'utilisationEndDate', header: 'Utilised to', render: (r) => formatDate(r.utilisationEndDate) },
    {
      key: 'conditionsToRelease',
      header: 'Release condition',
      render: (r) => r.conditionsToRelease || '—',
    },
    {
      key: 'priorUtilisationRequired',
      header: 'Gate',
      align: 'right',
      render: (r) =>
        r.priorUtilisationRequired != null ? `${Number(r.priorUtilisationRequired)}%` : '—',
    },
    {
      key: 'trancheStatus',
      header: 'Status',
      render: (r) => <StatusChip label={r.trancheStatus} tone={STATUS_TONE[r.trancheStatus] || 'neutral'} />,
    },
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
      <Stack spacing={1}>
        <DataTable
          title="Tranche schedule"
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
          Amounts are in the grant currency. Recording a receipt updates the funding position above.
          For Tranche-on-UC grants, "Utilised" (up to "Utilised to") is the basis for each tranche's
          Utilisation Certificate.
        </Typography>
      </Stack>
    </Box>
  );
}
