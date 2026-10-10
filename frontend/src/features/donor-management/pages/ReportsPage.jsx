import { Box, Stack } from '@mui/material';
import { DataTable, PageHeader } from '../../../shared/components/index.js';
import { formatInr } from '../../../lib/format/currency.js';
import { useFcraRegister } from '../hooks/useReports.js';

const fcraColumns = [
  { key: 'donorName', header: 'Donor', render: (r) => `${r.donorName} (${r.donorCode})` },
  { key: 'foreignCountryName', header: 'Country' },
  { key: 'foreignFundSourceType', header: 'Source' },
  { key: 'bankAccountRef', header: 'FCRA account' },
  { key: 'grantCode', header: 'Grant', width: 130 },
  { key: 'totalGrantAmount', header: 'Committed (₹)', align: 'right', render: (r) => formatInr(r.totalGrantAmount) },
  { key: 'receivedInr', header: 'Received (₹)', align: 'right', render: (r) => formatInr(r.receivedInr) },
];

/** /reports — FCRA register. */
export function ReportsPage() {
  const fcraQuery = useFcraRegister();

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="FCRA / foreign-contribution register"
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
      </Stack>
    </>
  );
}
