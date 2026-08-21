import { useMemo, useState } from 'react';
import { Box, MenuItem, Select, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { DataTable, PageHeader, SearchField, StatusChip } from '../../../shared/components/index.js';
import { useUserRequests } from '../hooks/useUserRequests.js';
import { USER_REQUEST_STATUS_TONE } from '../constants.js';

const STATUS_FILTERS = [
  { value: 'All', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

export function UserRequestsListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [organisationFilter, setOrganisationFilter] = useState('All');
  const requestsQuery = useUserRequests();

  const organisationOptions = useMemo(() => {
    const names = new Set((requestsQuery.data || []).map((r) => r.organisation).filter(Boolean));
    return ['All', ...Array.from(names).sort((a, b) => a.localeCompare(b))];
  }, [requestsQuery.data]);

  const rows = useMemo(() => {
    const requests = requestsQuery.data || [];
    const term = search.trim().toLowerCase();
    const filtered = requests.filter((r) => {
      const matchesSearch =
        !term ||
        r.name.toLowerCase().includes(term) ||
        r.email.toLowerCase().includes(term) ||
        r.role.toLowerCase().includes(term) ||
        r.organisation.toLowerCase().includes(term);
      const matchesStatus = statusFilter === 'All' || r.approvalStatus === statusFilter;
      const matchesOrganisation = organisationFilter === 'All' || r.organisation === organisationFilter;
      return matchesSearch && matchesStatus && matchesOrganisation;
    });
    return filtered.map((request, index) => ({ ...request, serialNo: index + 1 }));
  }, [requestsQuery.data, search, statusFilter, organisationFilter]);

  const columns = [
    {
      key: 'serialNo',
      header: 'SR NO',
      width: 70,
      render: (r) => <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.serialNo}</Typography>,
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
      render: (r) => r.role,
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
      render: (r) => (
        <StatusChip label={r.statusLabel} tone={USER_REQUEST_STATUS_TONE[r.approvalStatus] || 'neutral'} />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="User Requests"
        subtitle="Review, approve, and manage public account requests across the organisation."
      />

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
          {STATUS_FILTERS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>

        <Select
          size="small"
          value={organisationFilter}
          onChange={(e) => setOrganisationFilter(e.target.value)}
          sx={{ minWidth: 180 }}
        >
          {organisationOptions.map((name) => (
            <MenuItem key={name} value={name}>
              {name === 'All' ? 'All Organisations' : name}
            </MenuItem>
          ))}
        </Select>
      </Stack>

      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.id}
        isLoading={requestsQuery.isPending}
        error={requestsQuery.isError ? requestsQuery.error : null}
        onRetry={requestsQuery.refetch}
        emptyTitle="No user requests found"
        emptyDescription="Public account requests will appear here once submitted."
        onRowClick={(row) => navigate(`/user-requests/${row.id}`)}
      />
    </>
  );
}
