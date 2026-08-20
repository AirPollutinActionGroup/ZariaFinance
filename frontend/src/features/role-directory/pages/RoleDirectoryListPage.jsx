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
import { ConfirmDialog, DataTable, PageHeader, SearchField } from '../../../shared/components/index.js';
import { MOCK_ROLES } from '../data/mockRoles.js';

export function RoleDirectoryListPage() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState(MOCK_ROLES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [roleToToggle, setRoleToToggle] = useState(null);

  const filteredRoles = roles.filter((role) => {
    const matchesSearch =
      role.roleName.toLowerCase().includes(search.toLowerCase()) ||
      role.shortName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' || role.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleConfirmStatusChange = () => {
    if (!roleToToggle) return;
    const nextStatus = roleToToggle.status === 'Active' ? 'Inactive' : 'Active';
    setRoles((prev) =>
      prev.map((r) => (r.id === roleToToggle.id ? { ...r, status: nextStatus } : r))
    );
    setRoleToToggle(null);
  };

  const columns = [
    {
      key: 'srNo',
      header: 'S.NO',
      width: '10%',
      align: 'center',
      render: (r, idx) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {r.srNo || idx + 1}
        </Typography>
      ),
    },
    {
      key: 'roleName',
      header: 'ROLE NAME',
      width: '30%',
      align: 'center',
      render: (r) => <b>{r.roleName}</b>,
    },
    {
      key: 'shortName',
      header: 'ROLE SHORT NAME',
      width: '20%',
      align: 'center',
      render: (r) => r.shortName,
    },
    {
      key: 'status',
      header: 'STATUS',
      width: '20%',
      align: 'center',
      render: (r) => {
        let color = 'default';
        if (r.status === 'Active') color = 'success';
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
    {
      key: 'action',
      header: 'ACTION',
      width: '20%',
      align: 'center',
      render: (r) => (
        <Button
          size="small"
          variant="outlined"
          color={r.status === 'Active' ? 'warning' : 'success'}
          onClick={() => setRoleToToggle(r)}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Change Status
        </Button>
      ),
    },
  ];

  const dialogDescription = roleToToggle
    ? roleToToggle.status === 'Active'
      ? 'Are you sure you want to change the status of the user from active to inactive?'
      : 'Are you sure you want to change the status of the user from inactive to active?'
    : '';

  return (
    <>
      <PageHeader
        title="Role Directory"
        subtitle="Registered organisational roles and entities"
        actions={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/role-directory/new')}
          >
            New role
          </Button>
        }
      />

      <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ maxWidth: 420, flex: 1, minWidth: 240 }}>
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search by name, short name…"
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
          <MenuItem value="Inactive">Inactive</MenuItem>
        </Select>
      </Stack>

      <DataTable
        columns={columns}
        rows={filteredRoles}
        getRowKey={(r) => r.id}
        emptyTitle="No roles found"
      />

      <ConfirmDialog
        open={Boolean(roleToToggle)}
        title="Change Status"
        description={dialogDescription}
        confirmLabel="Confirm"
        confirmColor={roleToToggle?.status === 'Active' ? 'warning' : 'primary'}
        onConfirm={handleConfirmStatusChange}
        onClose={() => setRoleToToggle(null)}
      />
    </>
  );
}
