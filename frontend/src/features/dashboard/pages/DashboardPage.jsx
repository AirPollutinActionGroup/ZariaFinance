import { Grid, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  DataTable,
  ErrorState,
  LoadingState,
  PageHeader,
  StatCard,
  StatusChip,
} from '../../../shared/components/index.js';
import { formatDate } from '../../../lib/format/date.js';
import { formatInr } from '../../../lib/format/currency.js';
import { useDonors } from '../../donor-management/hooks/useDonors.js';
import { useGrants } from '../../donor-management/hooks/useGrants.js';
import {
  FUND_CLASS_TONE,
  GRANT_STATUS_TONE,
} from '../../donor-management/constants.js';
import { computeDashboardMetrics, recentGrants } from '../services/dashboardService.js';

const grantColumns = [
  { key: 'grantCode', header: 'Code', width: 110 },
  { key: 'agreementName', header: 'Agreement' },
  { key: 'donorName', header: 'Donor' },
  { key: 'startDate', header: 'Start', render: (row) => formatDate(row.startDate) },
  {
    key: 'totalGrantAmount',
    header: 'Committed',
    align: 'right',
    render: (row) => formatInr(row.totalGrantAmount),
  },
  {
    key: 'fundClass',
    header: 'Fund class',
    render: (row) => (
      <StatusChip label={row.fundClassLabel} tone={FUND_CLASS_TONE[row.fundClass] || 'neutral'} />
    ),
  },
  {
    key: 'grantStatus',
    header: 'Status',
    render: (row) => (
      <StatusChip label={row.statusLabel} tone={GRANT_STATUS_TONE[row.grantStatus] || 'neutral'} />
    ),
  },
];

/** Landing dashboard — aggregates live donor & grant data. */
export function DashboardPage() {
  const donorsQuery = useDonors('');
  const grantsQuery = useGrants({});
  const navigate = useNavigate();

  if (donorsQuery.isPending || grantsQuery.isPending) {
    return <LoadingState label="Loading dashboard…" />;
  }
  if (donorsQuery.isError) {
    return <ErrorState error={donorsQuery.error} onRetry={donorsQuery.refetch} />;
  }
  if (grantsQuery.isError) {
    return <ErrorState error={grantsQuery.error} onRetry={grantsQuery.refetch} />;
  }

  const metrics = computeDashboardMetrics(donorsQuery.data, grantsQuery.data);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Live position across donors and grant agreements"
      />
      <Stack spacing={3}>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Donors"
              value={metrics.donorCount}
              hint={`${metrics.activeDonorCount} active`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Grant agreements"
              value={metrics.grantCount}
              hint={`${metrics.openGrantCount} open`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard label="Total committed" value={formatInr(metrics.totalCommitted)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              label="Open commitments"
              value={formatInr(metrics.openCommitted)}
              hint="Approved · Active · On hold"
              highlight
            />
          </Grid>
        </Grid>

        <DataTable
          title="Recent grant agreements"
          columns={grantColumns}
          rows={recentGrants(grantsQuery.data)}
          getRowKey={(row) => row.id}
          emptyTitle="No grant agreements yet"
          emptyDescription="Once grants are recorded they will appear here."
          onRowClick={(row) => navigate(`/grants/${row.id}`)}
        />
      </Stack>
    </>
  );
}
