import { Box, Stack } from '@mui/material';
import { DataTable, PageHeader, StatusChip } from '../../../shared/components/index.js';
import { formatInr } from '../../../lib/format/currency.js';
import { useFcraRegister, useUtilisationCompliance } from '../hooks/useReports.js';

const fcraColumns = [
  { key: 'donorName', header: 'Donor', render: (r) => `${r.donorName} (${r.donorCode})` },
  { key: 'foreignCountryName', header: 'Country' },
  { key: 'foreignFundSourceType', header: 'Source' },
  { key: 'bankAccountRef', header: 'FCRA account' },
  { key: 'grantCode', header: 'Grant', width: 130 },
  {
    key: 'totalGrantAmount',
    header: 'Amount (foreign)',
    align: 'right',
    render: (r) => `${r.grantCurrency} ${Number(r.totalGrantAmount).toLocaleString('en-IN')}`,
  },
  { key: 'reportingAmountInr', header: 'Reporting (₹)', align: 'right', render: (r) => formatInr(r.reportingAmountInr) },
  { key: 'receivedInr', header: 'Received (₹)', align: 'right', render: (r) => formatInr(r.receivedInr) },
];

const utilColumns = [
  { key: 'grantCode', header: 'Grant', width: 130 },
  { key: 'donorName', header: 'Donor' },
  {
    key: 'fundClassCode',
    header: 'Class',
    render: (r) => (r.fundClassCode ? <StatusChip label={`Class ${r.fundClassCode}`} tone="neutral" /> : '—'),
  },
  {
    key: 'overheadLimitPercent',
    header: 'Overhead cap',
    align: 'right',
    render: (r) => (r.overheadLimitPercent != null ? `${r.overheadLimitPercent}%` : '—'),
  },
  { key: 'committed', header: 'Committed', align: 'right', render: (r) => formatInr(r.committed) },
  { key: 'received', header: 'Received', align: 'right', render: (r) => formatInr(r.received) },
  { key: 'utilised', header: 'Utilised', align: 'right', render: (r) => formatInr(r.utilised) },
  {
    key: 'utilisationPercent',
    header: 'Utilisation',
    align: 'right',
    render: (r) => (r.utilisationPercent != null ? `${r.utilisationPercent}%` : '—'),
  },
  {
    key: 'compliant',
    header: 'Status',
    render: (r) => <StatusChip label={r.compliant ? 'Compliant' : 'Breach'} tone={r.compliant ? 'success' : 'error'} />,
  },
];

/** /reports — FCRA register + utilisation compliance. */
export function ReportsPage() {
  const fcraQuery = useFcraRegister();
  const utilQuery = useUtilisationCompliance();

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="FCRA / foreign-contribution register and utilisation compliance"
      />
      <Stack spacing={4}>
        <Box>
          <DataTable
            title="FCRA register"
            columns={fcraColumns}
            rows={fcraQuery.data || []}
            getRowKey={(r) => `${r.donorCode}-${r.grantCode}`}
            isLoading={fcraQuery.isPending}
            error={fcraQuery.isError ? fcraQuery.error : null}
            onRetry={fcraQuery.refetch}
            emptyTitle="No foreign-contribution grants"
            emptyDescription="Grants from foreign / FCRA donors appear here."
          />
        </Box>
        <Box>
          <DataTable
            title="Utilisation compliance"
            columns={utilColumns}
            rows={utilQuery.data || []}
            getRowKey={(r) => r.grantCode}
            isLoading={utilQuery.isPending}
            error={utilQuery.isError ? utilQuery.error : null}
            onRetry={utilQuery.refetch}
            emptyTitle="No grants to report"
          />
        </Box>
      </Stack>
    </>
  );
}
