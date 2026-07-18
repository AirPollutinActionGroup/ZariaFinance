import { Box, Button, Stack, Tooltip, Typography } from '@mui/material';
import { DataTable, StatusChip } from '../../../shared/components/index.js';
import { ACTIONS, PermissionGate } from '../../../core/permissions/index.js';
import { formatDate } from '../../../lib/format/date.js';
import { useReceiveTranche, useTranchesByGrant } from '../hooks/useTranches.js';
import { MODULE_ID } from '../constants.js';

function money(currency, amount) {
  if (amount == null) return '—';
  const n = Number(amount).toLocaleString('en-IN');
  return currency && currency !== 'INR' ? `${currency} ${n}` : `₹${n}`;
}

/** Receipt track: has the cash arrived? (independent of the criteria gate). */
function receiptStatus(r) {
  return r.actualAmount != null ? { label: 'Received', tone: 'success' } : { label: 'Awaiting', tone: 'warning' };
}

/** Criteria track: is the release gate satisfied? Derived from the tranche's condition flag. */
function criteriaStatus(r) {
  const v = (r.conditionMet || '').toLowerCase();
  if (v.includes('met') && !v.includes('n/a')) return { label: 'Met', tone: 'success' };
  if (v.includes('pending')) return { label: 'Pending', tone: 'warning' };
  if (v.includes('n/a')) return { label: 'N/A', tone: 'neutral' };
  return { label: r.conditionMet || '—', tone: 'neutral' };
}

/** Computed variance flag: actual vs expected (never entered). */
function variance(currency, r) {
  if (r.actualAmount == null) return null;
  const diff = Number(r.actualAmount) - Number(r.trancheAmount);
  if (diff === 0) return { label: 'On target', tone: 'neutral' };
  const short = diff < 0;
  return { label: `${short ? 'Short' : 'Over'} ${money(currency, Math.abs(diff))}`, tone: short ? 'error' : 'info' };
}

/**
 * Box 5 — Tranche schedule: the inherited plan plus live reality. Two status
 * tracks are kept deliberately separate (spec §6): Criteria (is the gate
 * satisfied?) and Receipt (has cash arrived?) can diverge, so they are never
 * merged into one badge. Actual amount/date come from Tally and are read-only;
 * the variance is computed, never typed.
 */
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
    { key: 'trancheNumber', header: '#', width: 44 },
    { key: 'trancheAmount', header: 'Expected', align: 'right', render: (r) => money(grantCurrency, r.trancheAmount) },
    { key: 'plannedReleaseDate', header: 'Expected date', render: (r) => formatDate(r.plannedReleaseDate) },
    { key: 'conditionsToRelease', header: 'Release condition', render: (r) => r.conditionsToRelease || '—' },
    { key: 'actualAmount', header: 'Actual', align: 'right', render: (r) => money(grantCurrency, r.actualAmount) },
    { key: 'actualReleaseDate', header: 'Actual date', render: (r) => formatDate(r.actualReleaseDate) },
    {
      key: 'variance',
      header: 'Variance',
      render: (r) => {
        const v = variance(grantCurrency, r);
        return v ? <StatusChip label={v.label} tone={v.tone} /> : '—';
      },
    },
    {
      key: 'criteria',
      header: 'Criteria',
      render: (r) => {
        const c = criteriaStatus(r);
        return <StatusChip label={c.label} tone={c.tone} />;
      },
    },
    {
      key: 'receipt',
      header: 'Receipt',
      render: (r) => {
        const s = receiptStatus(r);
        return <StatusChip label={s.label} tone={s.tone} />;
      },
    },
    {
      key: 'action',
      header: '',
      align: 'right',
      render: (r) => {
        if (r.actualAmount != null) return null;
        const criteriaMet = (r.conditionMet || '').toLowerCase().includes('pending') === false;
        const button = (
          <Button size="small" onClick={() => markReceived(r)} disabled={receive.isPending || !criteriaMet}>
            Record receipt
          </Button>
        );
        return (
          <PermissionGate action={ACTIONS.EDIT} moduleId={MODULE_ID}>
            {criteriaMet ? (
              button
            ) : (
              // Gate the action visibly — disabled with a stated reason, not silently greyed.
              <Tooltip title="Release criteria not yet met">
                <span>{button}</span>
              </Tooltip>
            )}
          </PermissionGate>
        );
      },
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
          Amounts are in the grant currency. Criteria (release gate) and Receipt (cash arrived) are
          tracked separately. Actual amount/date originate from Tally; recording a receipt updates the
          funding position above.
        </Typography>
      </Stack>
    </Box>
  );
}
