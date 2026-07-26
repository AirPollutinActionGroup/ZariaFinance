import { useMemo, useState } from 'react';
import { Box, Button, Stack, ToggleButton, ToggleButtonGroup } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { ACTIONS, PermissionGate } from '../../../core/permissions/index.js';
import { DataTable, PageHeader, SearchField, StatusChip } from '../../../shared/components/index.js';
import { useDonors } from '../hooks/useDonors.js';
import {
  DONOR_ACTIVE_TONE,
  FUND_SOURCE_DOMICILE_TONE,
  MODULE_ID,
} from '../constants.js';

const columns = [
  { key: 'serialNo', header: 'S.No', width: 60, render: (row) => row.serialNo },
  { key: 'donorCode', header: 'Donor Code', width: 110 },
  { key: 'donorName', header: 'Donor Name' },
  { key: 'donorType', header: 'Donor Type', render: (row) => row.donorTypeLabel },
  {
    key: 'fundSourceDomicile',
    header: 'Fund source',
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
    render: (row) => (
      <StatusChip
        label={row.isActive ? 'Active' : 'Inactive'}
        tone={DONOR_ACTIVE_TONE[row.isActive] || 'neutral'}
      />
    ),
  },
];

/** Values: 'all' | 'active' | 'inactive'. */
const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

/** Donor register — /donors. */
export function DonorsListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const donorsQuery = useDonors(search);
  const navigate = useNavigate();

  const rows = useMemo(() => {
    const donors = donorsQuery.data || [];
    const filtered =
      statusFilter === 'active'
        ? donors.filter((donor) => donor.isActive)
        : statusFilter === 'inactive'
          ? donors.filter((donor) => !donor.isActive)
          : donors;
    return filtered.map((donor, index) => ({ ...donor, serialNo: index + 1 }));
  }, [donorsQuery.data, statusFilter]);

  return (
    <>
      <PageHeader
        title="Donor Register"
        subtitle="Funding sources across the organisation"
        actions={
          <PermissionGate action={ACTIONS.EDIT} moduleId={MODULE_ID}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/donors/new')}
            >
              New donor
            </Button>
          </PermissionGate>
        }
      />
      <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ maxWidth: 420, flex: 1, minWidth: 240 }}>
          <SearchField value={search} onChange={setSearch} placeholder="Search donors…" />
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
        isLoading={donorsQuery.isPending}
        error={donorsQuery.isError ? donorsQuery.error : null}
        onRetry={donorsQuery.refetch}
        emptyTitle="No donors registered"
        emptyDescription="Create the first donor record to start mapping funding sources."
        onRowClick={(row) => navigate(`/donors/${row.id}`)}
      />
    </>
  );
}
