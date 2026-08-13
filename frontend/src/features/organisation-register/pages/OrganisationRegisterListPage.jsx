import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { DataTable, PageHeader, SearchField } from '../../../shared/components/index.js';
import { MOCK_ORGANISATIONS } from '../data/mockOrganisations.js';

export function OrganisationRegisterListPage() {
  const navigate = useNavigate();
  const [organisations] = useState(MOCK_ORGANISATIONS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredOrganisations = organisations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.shortName.toLowerCase().includes(search.toLowerCase()) ||
      org.state.toLowerCase().includes(search.toLowerCase()) ||
      org.city.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' || org.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: 'srNo',
      header: 'S.NO',
      width: 70,
      render: (r, idx) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {r.srNo || idx + 1}
        </Typography>
      ),
    },
    {
      key: 'name',
      header: 'ORGANISATION NAME',
      render: (r) => <b>{r.name}</b>,
    },
    {
      key: 'shortName',
      header: 'ORGANISATION SHORT NAME',
      render: (r) => r.shortName,
    },
    {
      key: 'state',
      header: 'STATE',
      render: (r) => r.state,
    },
    {
      key: 'city',
      header: 'CITY',
      render: (r) => r.city,
    },
    {
      key: 'status',
      header: 'STATUS',
      width: 130,
      align: 'center',
      render: (r) => {
        let color = 'default';
        if (r.status === 'Active') color = 'success';
        else if (r.status === 'Pending') color = 'warning';
        else if (r.status === 'Inactive') color = 'error';

        return (
          <Chip
            label={r.status}
            color={color}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 600, minWidth: 80 }}
          />
        );
      },
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
            placeholder="Search by name, short name, state, or city…"
          />
        </Box>

        <Select
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 140, borderRadius: 2 }}
        >
          <MenuItem value="All">All Statuses</MenuItem>
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Inactive">Inactive</MenuItem>
        </Select>
      </Stack>

      <DataTable
        columns={columns}
        rows={filteredOrganisations}
        getRowKey={(r) => r.id}
        onRowClick={(r) => navigate(`/organisation-register/${r.id}`)}
        emptyTitle="No organisations found"
      />
    </>
  );
}
