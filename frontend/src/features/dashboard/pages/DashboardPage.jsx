import { useState } from 'react';
import { Alert, Box, Button, Grid, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  DataTable,
  ErrorState,
  LoadingState,
  PageHeader,
  StatCard,
  StatusChip,
} from '../../../shared/components/index.js';
import { formatInr } from '../../../lib/format/currency.js';
import { useDonors } from '../../donor-management/hooks/useDonors.js';
import { useGrants } from '../../donor-management/hooks/useGrants.js';
import {
  DONOR_STATUS_TONE,
  FUND_CLASS_TONE,
  GRANT_STATUS_TONE,
} from '../../donor-management/constants.js';
import {
  computeDashboardMetrics,
  grantsWithDonorStatusClash,
  recentGrants,
} from '../services/dashboardService.js';
import { computeFundingTotals, deriveGrantFunding } from '../services/mockFunding.js';
import { MOCK_DONORS, MOCK_GRANTS, isEmpty } from '../services/mockWorkbook.js';
import { FundingChainCard } from '../components/FundingChainCard.jsx';
import { RecordsDialog } from '../components/RecordsDialog.jsx';

/** Coloured inline fragment for the multi-part KPI hints. */
function Stat({ children, tone }) {
  return (
    <Box
      component="span"
      sx={{ color: tone ? `${tone}.main` : 'inherit', fontWeight: tone ? 600 : 'inherit' }}
    >
      {children}
    </Box>
  );
}

const donorDialogColumns = [
  { key: 'donorCode', header: 'Code' },
  { key: 'donorName', header: 'Donor' },
  { key: 'donorType', header: 'Type' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => (
      <StatusChip label={row.statusLabel || row.status} tone={DONOR_STATUS_TONE[row.status] || 'neutral'} />
    ),
  },
];

const grantDialogColumns = [
  { key: 'grantCode', header: 'Code' },
  { key: 'agreementName', header: 'Agreement' },
  { key: 'donorName', header: 'Donor' },
  {
    key: 'committed',
    header: 'Committed',
    align: 'right',
    render: (row) => formatInr(row.totalGrantAmount),
  },
  {
    key: 'grantStatus',
    header: 'Status',
    render: (row) => (
      <StatusChip label={row.statusLabel} tone={GRANT_STATUS_TONE[row.grantStatus] || 'neutral'} />
    ),
  },
];

const recentColumns = [
  {
    key: 'agreementName',
    header: 'Agreement',
    render: (row) => (
      <Box>
        <Box component="span" sx={{ display: 'block' }}>
          {row.grantCode}
        </Box>
        <Box component="span" sx={{ display: 'block', color: 'text.secondary', fontSize: 12 }}>
          {row.agreementName}
        </Box>
      </Box>
    ),
  },
  { key: 'donorName', header: 'Donor' },
  { key: 'programmeName', header: 'Programme', render: (row) => row.programmeName || '—' },
  {
    key: 'committed',
    header: 'Committed',
    align: 'right',
    render: (row) => formatInr(row.totalGrantAmount),
  },
  {
    key: 'received',
    header: 'Received',
    align: 'right',
    render: (row) => formatInr(deriveGrantFunding(row).receivedInr),
  },
  {
    key: 'available',
    header: 'Available',
    align: 'right',
    render: (row) => {
      const f = deriveGrantFunding(row);
      return f.blocked ? (
        <Box component="span" sx={{ color: 'error.main', fontStyle: 'italic' }}>
          blocked
        </Box>
      ) : (
        formatInr(f.availableInr)
      );
    },
  },
  {
    key: 'grantStatus',
    header: 'Status',
    render: (row) => (
      <StatusChip label={row.statusLabel} tone={GRANT_STATUS_TONE[row.grantStatus] || 'neutral'} />
    ),
  },
];

/** Landing dashboard — aggregates live donor & grant data (funding chain illustrative). */
export function DashboardPage() {
  const donorsQuery = useDonors('');
  const grantsQuery = useGrants({});
  const navigate = useNavigate();
  const [dialog, setDialog] = useState(null); // 'donors' | 'grants' | null

  if (donorsQuery.isPending || grantsQuery.isPending) {
    return <LoadingState label="Loading dashboard…" />;
  }
  if (donorsQuery.isError) {
    return <ErrorState error={donorsQuery.error} onRetry={donorsQuery.refetch} />;
  }
  if (grantsQuery.isError) {
    return <ErrorState error={grantsQuery.error} onRetry={grantsQuery.refetch} />;
  }

  // Live donor/grant data when the backend has a real portfolio; otherwise fall
  // back to the illustrative "Master Workbook" so a fresh database still renders
  // the approved demo dashboard. The fallback is all-or-nothing: donors and
  // grants are linked by donorId, so mixing live donors with mock grants (or
  // vice versa) would break referential integrity — if either side is empty we
  // use the whole mock workbook. (Received/utilised/available are illustrative
  // in both cases — see mockFunding.js.)
  const usingMock = isEmpty(donorsQuery.data) || isEmpty(grantsQuery.data);
  const donors = usingMock ? MOCK_DONORS : donorsQuery.data;
  const grants = usingMock ? MOCK_GRANTS : grantsQuery.data;

  const metrics = computeDashboardMetrics(donors, grants);
  const funding = computeFundingTotals(grants);
  const clashGrants = grantsWithDonorStatusClash(donors, grants);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Live donor-module position · click any number, status or chain stage for a quick look — nothing leaves this page"
      />

      <Stack spacing={3}>
        {usingMock ? (
          <Alert severity="info" variant="outlined" icon={false} sx={{ py: 0.5 }}>
            Design preview · data from the “Donor Module Master Workbook” (illustrative). Figures
            switch to live records as soon as the backend has donors and grants.
          </Alert>
        ) : null}

        {clashGrants.length > 0 ? (
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => setDialog('grants')}>
                View grants
              </Button>
            }
          >
            <strong>Exception · governance</strong> — {clashGrants.length} active grant
            {clashGrants.length > 1 ? 's are' : ' is'} attached to an inactive donor. System rule: an
            active grant cannot hang off a non-active donor.
          </Alert>
        ) : null}

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Donors"
              value={metrics.donorCount}
              hint={
                <>
                  <Stat tone="success">{metrics.activeDonorCount} active</Stat>
                  {metrics.draftDonorCount > 0 ? (
                    <>
                      {' · '}
                      {metrics.draftDonorCount} draft{' '}
                      <Stat tone="error">(blocking {formatInr(metrics.draftBlockingAmount)})</Stat>
                    </>
                  ) : null}
                </>
              }
              onClick={() => setDialog('donors')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Grant agreements"
              value={metrics.grantCount}
              hint={
                <>
                  <Stat tone="success">{metrics.activeGrantCount} active</Stat>
                  {metrics.closedGrantCount > 0 ? <> · {metrics.closedGrantCount} closed</> : null}
                  {metrics.blockedGrantCount > 0 ? (
                    <>
                      {' · '}
                      <Stat tone="error">{metrics.blockedGrantCount} blocked</Stat>
                    </>
                  ) : null}
                </>
              }
              onClick={() => setDialog('grants')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Funding committed (receivable)"
              value={formatInr(funding.committed)}
              hint="outstanding pipeline · not yet income"
              onClick={() => setDialog('grants')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Available (unspent, realised)"
              value={formatInr(funding.available)}
              hint="received − utilised · see utilisation"
              accent
              onClick={() => setDialog('grants')}
            />
          </Grid>
        </Grid>

        <FundingChainCard totals={funding} />

        <Box>
          <DataTable
            title="Recent grant agreements"
            columns={recentColumns}
            rows={recentGrants(grants, 6)}
            getRowKey={(row) => row.id}
            emptyTitle="No grant agreements yet"
            emptyDescription="Once grants are recorded they will appear here."
            onRowClick={(row) => navigate(`/grants/${row.id}`)}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
            Committed and status are live; Received and Available are illustrative until the backend
            tracks receipts and utilisation.
          </Typography>
        </Box>
      </Stack>

      <RecordsDialog
        open={dialog === 'donors'}
        onClose={() => setDialog(null)}
        title={`Donors (${donors.length})`}
        columns={donorDialogColumns}
        rows={donors}
        primaryAction={{ label: 'Open Donor Register →', onClick: () => navigate('/donors') }}
      />
      <RecordsDialog
        open={dialog === 'grants'}
        onClose={() => setDialog(null)}
        title={`Grant agreements (${grants.length})`}
        columns={grantDialogColumns}
        rows={grants}
        primaryAction={{ label: 'Open Grant Agreements →', onClick: () => navigate('/grants') }}
      />
    </>
  );
}
