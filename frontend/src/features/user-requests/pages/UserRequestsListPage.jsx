import { useState } from 'react';
import {
  Box,
  Chip,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DataTable, PageHeader, SearchField } from '../../../shared/components/index.js';
import { MOCK_USER_REQUESTS } from '../data/mockRequests.js';

export function UserRequestsListPage() {
  const navigate = useNavigate();
  const [requests] = useState(MOCK_USER_REQUESTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.role.toLowerCase().includes(search.toLowerCase()) ||
      r.organisation.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' || r.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: 'srNo',
      header: 'SR NO',
      width: 70,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.srNo}</Typography>,
    },
    {
      key: 'name',
      header: 'NAME',
      render: (r) => <b>{r.name}</b>,
    },
    {
      key: 'email',
      header: 'EMAIL ID',
      render: (r) => r.email,
    },
    {
      key: 'phone',
      header: 'PHONE NUMBER',
      sx: { whiteSpace: 'nowrap' },
      render: (r) => (
        <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
          {r.phone}
        </Box>
      ),
    },
    {
      key: 'role',
      header: 'ROLE',
      render: (r) => (
        <Chip label={r.role} size="small" variant="outlined" sx={{ fontSize: 11.5 }} />
      ),
    },
    {
      key: 'organisation',
      header: 'ORGANISATION',
      render: (r) => r.organisation,
    },
    {
      key: 'status',
      header: 'STATUS',
      width: 130,
      align: 'center',
      render: (r) => {
        let color = 'default';
        if (r.status === 'Approved') color = 'success';
        else if (r.status === 'Rejected') color = 'error';
        else if (r.status === 'Pending') color = 'warning';

        return (
          <Chip
            label={r.status}
            size="small"
            color={color}
            variant="outlined"
            sx={{ fontWeight: 700, fontSize: 11 }}
          />
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="User Requests"
        subtitle="Review, approve, and manage public account requests across the organisation."
      />

      {/* Filter Bar */}
      <Stack direction="row" spacing={1.5} flexWrap="wrap" sx={{ mb: 2, alignItems: 'center' }}>
        <Box sx={{ flex: '1 1 240px' }}>
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search by name, email, role, organisation…"
          />
        </Box>

        <Select
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="All">All Statuses</MenuItem>
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Approved">Approved</MenuItem>
          <MenuItem value="Rejected">Rejected</MenuItem>
        </Select>
      </Stack>

      {/* Data Table */}
      <DataTable
        columns={columns}
        rows={filteredRequests}
        getRowKey={(row) => row.id}
        onRowClick={(row) => navigate(`/user-requests/${row.id}`)}
      />
    </>
  );
}
