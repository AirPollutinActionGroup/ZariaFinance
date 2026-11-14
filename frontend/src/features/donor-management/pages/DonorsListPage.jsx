import { useMemo, useState } from 'react';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { ACTIONS, PermissionGate } from '../../../core/permissions/index.js';
import { DataTable, PageHeader, SearchField, StatStrip, StatusChip } from '../../../shared/components/index.js';
import { useDonors } from '../hooks/useDonors.js';
import {
  DONOR_ACTIVE_TONE,
  FUND_SOURCE_DOMICILE_TONE,
  MODULE_ID,
} from '../constants.js';

const columns = [
  { key: 'serialNo', header: 'S.No', width: 56, render: (row) => row.serialNo },
  {
    key: 'donorCode',
    header: 'Donor Code',
    sx: { whiteSpace: 'nowrap' },
    sortValue: (row) => row.donorCode,
  },
  {
    key: 'donorName',
    header: 'Donor',
    sortValue: (row) => row.donorName,
    render: (row) => (
      <Box sx={{ minWidth: 200 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.35 }}>
          {row.donorName}
        </Typography>
        {row.email ? (
          <Typography variant="caption" color="text.secondary">
            {row.email}
          </Typography>
        ) : null}
      </Box>
    ),
  },
  {
    key: 'donorType',
    header: 'Donor Type',
    sx: { whiteSpace: 'nowrap' },
    sortValue: (row) => row.donorTypeLabel,
    render: (row) => row.donorTypeLabel,
  },
  {
    key: 'fundSourceDomicile',
    header: 'Fund source',
    sortValue: (row) => row.fundSourceDomicileLabel,
    render: (row) => (
      <StatusChip
        label={row.fundSourceDomicileLabel}
        tone={FUND_SOURCE_DOMICILE_TONE[row.fundSourceDomicile] || 'neutral'}
      />
    ),
  },
  {
    key: 'isActive',
    header: 'Status',
    sortValue: (row) => (row.isActive ? 0 : 1),
    render: (row) => (
      <StatusChip
        label={row.isActive ? 'Active' : 'Inactive'}
        tone={DONOR_ACTIVE_TONE[row.isActive] || 'neutral'}
      />
    ),
  },
];

/** Status filter chips; `match` picks the donors each one shows. */
const STATUS_FILTERS = [
  { value: 'all', label: 'All', match: () => true },
  { value: 'active', label: 'Active', match: (d) => d.isActive },
  { value: 'inactive', label: 'Inactive', match: (d) => !d.isActive },
];

/** Donor register — /donors. */
export function DonorsListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const donorsQuery = useDonors(search);
  const navigate = useNavigate();

  // While a new search loads, keep showing the last result so the page doesn't
  // jump (the summary strip would vanish and the search box would move).
  const [lastDonors, setLastDonors] = useState(null);
  if (donorsQuery.data && donorsQuery.data !== lastDonors) setLastDonors(donorsQuery.data);
  const shown = donorsQuery.data || lastDonors;
  const donors = useMemo(() => shown || [], [shown]);

  const rows = useMemo(() => {
    const filter = STATUS_FILTERS.find((f) => f.value === statusFilter) || STATUS_FILTERS[0];
    return donors.filter(filter.match).map((donor, index) => ({ ...donor, serialNo: index + 1 }));
  }, [donors, statusFilter]);

  const foreign = donors.filter((d) => d.fundSourceDomicile === 'FOREIGN').length;
  const stats = [
    { label: 'Donors', value: donors.length },
    { label: 'Active', value: donors.filter((d) => d.isActive).length, color: 'success.main' },
    { label: 'Domestic', value: donors.length - foreign },
    { label: 'Foreign · FCRA', value: foreign },
  ];

  return (
    <>
      <PageHeader
        title="Donor Register"
        subtitle="Funding sources across the organisation"
        actions={
          <PermissionGate action={ACTIONS.EDIT} moduleId={MODULE_ID}>
            <Button
              id="tour-new-donor"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/donors/new')}
            >
              New donor
            </Button>
          </PermissionGate>
        }
      />
      {donors.length ? <StatStrip stats={stats} sx={{ mb: 2 }} /> : null}
      {/* Kept outside the DataTable: the table swaps to a loading state while a
          new search runs, which would otherwise unmount the search box. */}
      <Stack
        id="tour-donors-filters"
        direction="row"
        sx={{ mb: 1.5, gap: 1, alignItems: 'center', flexWrap: 'wrap' }}
      >
        <Box sx={{ width: { xs: '100%', sm: 280 }, mr: { sm: 1 } }}>
          <SearchField value={search} onChange={setSearch} placeholder="Search donors…" />
        </Box>
        {STATUS_FILTERS.map((f) => {
          const selected = statusFilter === f.value;
          return (
            <Chip
              key={f.value}
              size="small"
              label={`${f.label} · ${donors.filter(f.match).length}`}
              onClick={() => setStatusFilter(f.value)}
              color={selected ? 'primary' : 'default'}
              variant={selected ? 'filled' : 'outlined'}
              aria-pressed={selected}
            />
          );
        })}
      </Stack>
      <DataTable
        dense
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.id}
        isLoading={donorsQuery.isPending && !shown}
        error={donorsQuery.isError ? donorsQuery.error : null}
        onRetry={donorsQuery.refetch}
        emptyTitle={donors.length ? 'No donors with this status' : 'No donors registered'}
        emptyDescription={
          donors.length
            ? 'Pick another status above, or All.'
            : 'Create the first donor record to start mapping funding sources.'
        }
        onRowClick={(row) => navigate(`/donors/${row.id}`)}
      />
    </>
  );
}
