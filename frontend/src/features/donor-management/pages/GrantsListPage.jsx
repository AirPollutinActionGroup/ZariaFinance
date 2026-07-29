import { useMemo, useState } from 'react';
import { Box, Button, FormControl, MenuItem, Select, Stack } from '@mui/material';
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
    header: 'Approval Status',
    render: (row) => (
      <StatusChip
        label={GRANT_APPROVAL_STATUS[row.isApproved] || '—'}
        tone={GRANT_APPROVAL_STATUS_TONE[row.isApproved] || 'neutral'}
      />
    ),
  },
];

const APPROVAL_STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'onhold', label: 'On hold' },
  { value: 'completed', label: 'Completed' },
];

/** Grant agreement pipeline — /grants. */
export function GrantsListPage() {
  const [search, setSearch] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const grantsQuery = useGrants(search ? { search } : {});
  const navigate = useNavigate();

  const rows = useMemo(() => {
    const grants = grantsQuery.data || [];
    if (approvalFilter === 'pending') return grants.filter((grant) => grant.isApproved === 2);
    if (approvalFilter === 'onhold') return grants.filter((grant) => grant.isApproved === 3);
    if (approvalFilter === 'completed') return grants.filter((grant) => grant.isApproved === 4);
    return grants;
  }, [grantsQuery.data, approvalFilter]);

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
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value)}
            sx={{
              height: 38,
              borderRadius: 1.5,
              fontSize: 13,
              fontWeight: 500,
              bgcolor: 'background.paper',
            }}
          >
            {APPROVAL_STATUS_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 13 }}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
