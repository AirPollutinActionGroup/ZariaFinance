import { useMemo, useState } from 'react';
import { Box, Button, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { ACTIONS, PermissionGate } from '../../../core/permissions/index.js';
import { DataTable, PageHeader, SearchField, StatusChip } from '../../../shared/components/index.js';
import { formatDate } from '../../../lib/format/date.js';
import { formatInr } from '../../../lib/format/currency.js';
import { useGrants } from '../hooks/useGrants.js';
import {
  FUND_CLASS_CODE_TONE,
  GRANT_ACTIVE_TONE,
  GRANT_APPROVAL_STATUS,
  GRANT_APPROVAL_STATUS_TONE,
  MODULE_ID,
} from '../constants.js';

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
    key: 'isApproved',
    header: 'Grant Status',
    render: (row) => (
      <StatusChip
        label={GRANT_APPROVAL_STATUS[row.isApproved] || '—'}
        tone={GRANT_APPROVAL_STATUS_TONE[row.isApproved] || 'neutral'}
      />
    ),
  },
  {
    key: 'isActive',
    header: 'Status',
    render: (row) => (
      <StatusChip label={row.statusLabel} tone={GRANT_ACTIVE_TONE[row.isActive] || 'neutral'} />
    ),
  },
];

/** Values: 'all' | 'active' | 'inactive'. */
const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

/** Grant agreement pipeline — /grants. */
export function GrantsListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const grantsQuery = useGrants(search ? { search } : {});
  const navigate = useNavigate();

  const rows = useMemo(() => {
    const grants = grantsQuery.data || [];
    if (statusFilter === 'active') return grants.filter((grant) => grant.isActive);
    if (statusFilter === 'inactive') return grants.filter((grant) => !grant.isActive);
    return grants;
  }, [grantsQuery.data, statusFilter]);

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
      <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ maxWidth: 420, flex: 1, minWidth: 240 }}>
          <SearchField value={search} onChange={setSearch} placeholder="Search grants…" />
        </Box>
        <ToggleButtonGroup
          value={statusFilter}
          exclusive
          size="small"
          onChange={(_, next) => next && setStatusFilter(next)}
        >
          {STATUS_FILTERS.map((option) => (
            <ToggleButton key={option.value} value={option.value}>
              {option.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>
      <DataTable
        columns={columns}
        rows={rows}
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
