import { useMemo, useState } from 'react';
import { Box, Button, MenuItem, Select, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { DataTable, PageHeader, SearchField, StatusChip } from '../../../shared/components/index.js';
import { useOrganisations } from '../hooks/useOrganisations.js';
import { ORGANISATION_STATUS_TONE } from '../constants.js';

const STATUS_FILTERS = [
  { value: 'All', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'INACTIVE', label: 'Inactive' },
];

export function OrganisationRegisterListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const organisationsQuery = useOrganisations(search);

  const rows = useMemo(() => {
    const organisations = organisationsQuery.data || [];
    const filtered =
      statusFilter === 'All'
        ? organisations
        : organisations.filter((org) => org.status === statusFilter);
    return filtered.map((org, index) => ({ ...org, serialNo: index + 1 }));
  }, [organisationsQuery.data, statusFilter]);

  const columns = [
    {
      key: 'serialNo',
      header: 'S.NO',
      width: 70,
      render: (row) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {row.serialNo}
        </Typography>
      ),
    },
    {
      key: 'name',
      header: 'ORGANISATION NAME',
      render: (row) => <b>{row.name}</b>,
    },
    {
      key: 'shortName',
      header: 'ORGANISATION SHORT NAME',
      render: (row) => row.shortName,
    },
    {
      key: 'stateName',
      header: 'STATE',
      render: (row) => row.stateName,
    },
    {
      key: 'cityName',
      header: 'CITY',
      render: (row) => row.cityName,
    },
    {
      key: 'status',
      header: 'STATUS',
      width: 130,
      align: 'center',
      render: (row) => (
        <StatusChip
          label={row.statusLabel}
          tone={ORGANISATION_STATUS_TONE[row.status] || 'neutral'}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Organisation Register"
        subtitle="Registered partner organisations and entities"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/organisation-register/new')}
          >
            New registration
          </Button>
        }
      />

      <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ maxWidth: 420, flex: 1, minWidth: 240 }}>
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search by name or short name…"
          />
        </Box>

        <Select
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 140, borderRadius: 2 }}
        >
          {STATUS_FILTERS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </Stack>

      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.id}
        isLoading={organisationsQuery.isPending}
        error={organisationsQuery.isError ? organisationsQuery.error : null}
        onRetry={organisationsQuery.refetch}
        onRowClick={(row) => navigate(`/organisation-register/${row.id}`)}
        emptyTitle="No organisations found"
        emptyDescription="Register the first partner organisation to see it here."
      />
    </>
  );
}
