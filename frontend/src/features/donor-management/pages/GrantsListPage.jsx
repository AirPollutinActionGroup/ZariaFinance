import { useMemo, useState } from 'react';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { ACTIONS, PermissionGate } from '../../../core/permissions/index.js';
import { DataTable, PageHeader, SearchField, StatStrip, StatusChip } from '../../../shared/components/index.js';
import { formatDate } from '../../../lib/format/date.js';
import { formatInr } from '../../../lib/format/currency.js';
import { useGrants } from '../hooks/useGrants.js';
import {
  FUND_CLASS_CODE_TONE,
  FUND_CLASS_SHORT,
  GRANT_APPROVAL_STATUS,
  GRANT_APPROVAL_STATUS_TONE,
  MODULE_ID,
} from '../constants.js';

/** The backend sends either "A" or the full enum ("CLASS_A_RESTRICTED"); show "A". */
const classLetter = (code) => (code ? FUND_CLASS_SHORT[code] || code : null);

const columns = [
  {
    key: 'grantCode',
    header: 'Code',
    sx: { whiteSpace: 'nowrap' },
    sortValue: (row) => row.grantCode,
  },
  {
    key: 'agreementName',
    header: 'Agreement / Donor',
    sortValue: (row) => row.agreementName,
    render: (row) => (
      <Box sx={{ minWidth: 200 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.35 }}>
          {row.agreementName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {row.donorName}
        </Typography>
      </Box>
    ),
  },
  {
    key: 'period',
    header: 'Period',
    sx: { whiteSpace: 'nowrap' },
    sortValue: (row) => row.startDate,
    render: (row) => (
      <>
        <Typography variant="body2" sx={{ lineHeight: 1.35 }}>
          {formatDate(row.startDate)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          to {formatDate(row.endDate)}
        </Typography>
      </>
    ),
  },
  {
    key: 'totalGrantAmount',
    header: 'Committed',
    align: 'right',
    sx: { whiteSpace: 'nowrap', fontWeight: 600 },
    sortValue: (row) => Number(row.totalGrantAmount) || 0,
    render: (row) => formatInr(row.totalGrantAmount),
  },
  {
    key: 'fundClassCode',
    header: 'Class',
    align: 'center',
    render: (row) => {
      const letter = classLetter(row.fundClassCode);
      return letter ? <StatusChip label={letter} tone={FUND_CLASS_CODE_TONE[letter] || 'neutral'} /> : '—';
    },
  },
  {
    key: 'isApproved',
    header: 'Status',
    sortValue: (row) => GRANT_APPROVAL_STATUS[row.isApproved] || '',
    render: (row) => (
      <StatusChip
        label={GRANT_APPROVAL_STATUS[row.isApproved] || '—'}
        tone={GRANT_APPROVAL_STATUS_TONE[row.isApproved] || 'neutral'}
      />
    ),
  },
];

/** Status filter chips; `value` matches grant.isApproved (null = all). */
const STATUS_FILTERS = [
  { key: 'all', label: 'All', value: null },
  { key: 'approved', label: 'Approved', value: 1 },
  { key: 'pending', label: 'Pending', value: 2 },
  { key: 'onhold', label: 'On hold', value: 3 },
  { key: 'completed', label: 'Completed', value: 4 },
];

/** Count / committed totals for the grants in view. */
function SummaryStrip({ grants }) {
  const committed = grants.reduce((sum, g) => sum + (Number(g.totalGrantAmount) || 0), 0);
  const count = (status) => grants.filter((g) => g.isApproved === status).length;
  const stats = [
    { label: 'Agreements', value: grants.length },
    { label: 'Committed', value: formatInr(committed) },
    { label: 'Approved', value: count(1), color: 'success.main' },
    { label: 'Pending approval', value: count(2), color: 'warning.main' },
  ];

  return <StatStrip stats={stats} sx={{ mb: 2 }} />;
}

/** Grant agreement pipeline — /grants. */
export function GrantsListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const grantsQuery = useGrants(search ? { search } : {});
  const navigate = useNavigate();

  // While a new search loads, keep showing the last result so the page doesn't
  // jump (the summary strip would vanish and the search box would move).
  const [lastGrants, setLastGrants] = useState(null);
  if (grantsQuery.data && grantsQuery.data !== lastGrants) setLastGrants(grantsQuery.data);
  const shown = grantsQuery.data || lastGrants;
  const grants = useMemo(() => shown || [], [shown]);
  const rows = useMemo(() => {
    const filter = STATUS_FILTERS.find((f) => f.key === statusFilter);
    return filter?.value == null ? grants : grants.filter((g) => g.isApproved === filter.value);
  }, [grants, statusFilter]);

  // Kept outside the DataTable: the table swaps to a loading state while a new
  // search runs, which would otherwise unmount the search box mid-typing.
  const toolbar = (
    <Stack direction="row" sx={{ mb: 1.5, gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
      <Box sx={{ width: { xs: '100%', sm: 280 }, mr: { sm: 1 } }}>
        <SearchField value={search} onChange={setSearch} placeholder="Search grants…" />
      </Box>
      {STATUS_FILTERS.map((f) => {
        const n = f.value == null ? grants.length : grants.filter((g) => g.isApproved === f.value).length;
        const selected = statusFilter === f.key;
        return (
          <Chip
            key={f.key}
            size="small"
            label={`${f.label} · ${n}`}
            onClick={() => setStatusFilter(f.key)}
            color={selected ? 'primary' : 'default'}
            variant={selected ? 'filled' : 'outlined'}
            aria-pressed={selected}
          />
        );
      })}
    </Stack>
  );

  return (
    <>
      <PageHeader
        title="Grant Agreements"
        subtitle="Signed and pipeline funding agreements"
        actions={
          <PermissionGate action={ACTIONS.EDIT} moduleId={MODULE_ID}>
            <Button
              id="tour-new-grant"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/grants/new')}
            >
              New grant
            </Button>
          </PermissionGate>
        }
      />
      {grants.length ? <SummaryStrip grants={grants} /> : null}
      {toolbar}
      <DataTable
        dense
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.id}
        isLoading={grantsQuery.isPending && !shown}
        error={grantsQuery.isError ? grantsQuery.error : null}
        onRetry={grantsQuery.refetch}
        emptyTitle={grants.length ? 'No grants with this status' : 'No grant agreements'}
        emptyDescription={
          grants.length
            ? 'Pick another status above, or All.'
            : 'Create a grant agreement to start tracking committed funding.'
        }
        onRowClick={(row) => navigate(`/grants/${row.id}`)}
      />
    </>
  );
}
