import { useState } from 'react';
import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { ACTIONS, PermissionGate } from '../../../core/permissions/index.js';
import { DataTable, PageHeader, SearchField, StatusChip } from '../../../shared/components/index.js';
import { formatDate } from '../../../lib/format/date.js';
import { formatInr } from '../../../lib/format/currency.js';
import { useGrants } from '../hooks/useGrants.js';
import { FUND_CLASS_CODE_TONE, GRANT_STATUS_TONE, MODULE_ID } from '../constants.js';

const columns = [
  { key: 'grantCode', header: 'Code', width: 110 },
  { key: 'agreementName', header: 'Agreement' },
  { key: 'donorName', header: 'Donor' },
  { key: 'programmeName', header: 'Programme' },
  { key: 'startDate', header: 'Start', render: (row) => formatDate(row.startDate) },
  { key: 'endDate', header: 'End', render: (row) => formatDate(row.endDate) },
  {
    key: 'totalGrantAmount',
    header: 'Committed',
    align: 'right',
    render: (row) =>
      row.grantCurrency && row.grantCurrency !== 'INR'
        ? `${row.grantCurrency} ${Number(row.totalGrantAmount).toLocaleString('en-IN')}`
        : formatInr(row.totalGrantAmount),
  },
  {
    key: 'reportingAmountInr',
    header: 'Reporting (₹)',
    align: 'right',
    render: (row) => formatInr(row.reportingAmountInr ?? row.totalGrantAmount),
  },
  {
    key: 'fundClassCode',
    header: 'Class',
    render: (row) =>
      row.fundClassCode ? (
        <StatusChip label={`Class ${row.fundClassCode}`} tone={FUND_CLASS_CODE_TONE[row.fundClassCode] || 'neutral'} />
      ) : (
        '—'
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

/** Grant agreement pipeline — /grants. */
export function GrantsListPage() {
  const [search, setSearch] = useState('');
  const grantsQuery = useGrants(search ? { search } : {});
  const navigate = useNavigate();

  return (
    <>
      <PageHeader
        title="Grant Agreements"
        subtitle="Signed and pipeline funding agreements"
        actions={
          <PermissionGate action={ACTIONS.EDIT} moduleId={MODULE_ID}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/grants/new')}
            >
              New grant
            </Button>
          </PermissionGate>
        }
      />
      <Box sx={{ mb: 2, maxWidth: 420 }}>
        <SearchField value={search} onChange={setSearch} placeholder="Search grants…" />
      </Box>
      <DataTable
        columns={columns}
        rows={grantsQuery.data || []}
        getRowKey={(row) => row.id}
        isLoading={grantsQuery.isPending}
        error={grantsQuery.isError ? grantsQuery.error : null}
        onRetry={grantsQuery.refetch}
        emptyTitle="No grant agreements"
        emptyDescription="Create a grant agreement to start tracking committed funding."
        onRowClick={(row) => navigate(`/grants/${row.id}`)}
      />
    </>
  );
}
