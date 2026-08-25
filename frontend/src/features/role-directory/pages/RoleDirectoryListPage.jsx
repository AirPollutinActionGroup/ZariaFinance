import { useMemo, useState } from 'react';
import { Box, Button, MenuItem, Select, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import { ConfirmDialog, DataTable, PageHeader, SearchField, StatusChip } from '../../../shared/components/index.js';
import { ManageRoleUsersDialog } from '../components/ManageRoleUsersDialog.jsx';
import { useRoles, useRoleLifecycle } from '../hooks/useRoles.js';
import { PERMISSION_ROLE_LABEL, ROLE_STATUS_TONE } from '../constants.js';

const STATUS_FILTERS = [
  { value: 'All', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

export function RoleDirectoryListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [roleToToggle, setRoleToToggle] = useState(null);
  const [roleToManage, setRoleToManage] = useState(null);
  const rolesQuery = useRoles(search);
  const roleLifecycle = useRoleLifecycle();

  const rows = useMemo(() => {
    const roles = rolesQuery.data || [];
    const filtered = statusFilter === 'All' ? roles : roles.filter((r) => r.status === statusFilter);
    return filtered.map((role, index) => ({ ...role, serialNo: index + 1 }));
  }, [rolesQuery.data, statusFilter]);

  const handleConfirmStatusChange = async () => {
    if (!roleToToggle) return;
    const action = roleToToggle.status === 'ACTIVE' ? 'deactivate' : 'activate';
    await roleLifecycle.mutateAsync({ id: roleToToggle.id, action });
    setRoleToToggle(null);
  };

  const columns = [
    {
      key: 'serialNo',
      header: 'S.NO',
      width: '6%',
      align: 'center',
      render: (r) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {r.serialNo}
        </Typography>
      ),
    },
    {
      key: 'roleName',
      header: 'ROLE NAME',
      width: '20%',
      align: 'center',
      render: (r) => <b>{r.roleName}</b>,
    },
    {
      key: 'shortName',
      header: 'ROLE SHORT NAME',
      width: '13%',
      align: 'center',
      render: (r) => r.shortName,
    },
    {
      key: 'userLimit',
      header: 'USER LIMIT',
      width: '12%',
      align: 'center',
      render: (r) => (
        <Button
          size="small"
          variant="text"
          startIcon={<GroupOutlinedIcon fontSize="small" />}
          onClick={() => setRoleToManage(r)}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          {r.userLimitLabel}
        </Button>
      ),
    },
    {
      key: 'permissionRole',
      header: 'PERMISSION ROLE',
      width: '15%',
      align: 'center',
      render: (r) => PERMISSION_ROLE_LABEL[r.permissionRole] || r.permissionRole || '—',
    },
    {
      key: 'status',
      header: 'STATUS',
      width: '16%',
      align: 'center',
      render: (r) => (
        <StatusChip label={r.statusLabel} tone={ROLE_STATUS_TONE[r.status] || 'neutral'} />
      ),
    },
    {
      key: 'action',
      header: 'ACTION',
      width: '18%',
      align: 'center',
      render: (r) => (
        <Button
          size="small"
          variant="outlined"
          color={r.status === 'ACTIVE' ? 'warning' : 'success'}
          onClick={() => setRoleToToggle(r)}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Change Status
        </Button>
      ),
    },
  ];

  const dialogDescription = roleToToggle
    ? roleToToggle.status === 'ACTIVE'
      ? 'Are you sure you want to change the status of the role from active to inactive?'
      : 'Are you sure you want to change the status of the role from inactive to active?'
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
        getRowKey={(r) => r.id}
        isLoading={rolesQuery.isPending}
        error={rolesQuery.isError ? rolesQuery.error : null}
        onRetry={rolesQuery.refetch}
        emptyTitle="No roles found"
        emptyDescription="Create the first organisational role to see it here."
      />

      <ConfirmDialog
        open={Boolean(roleToToggle)}
        title="Change Status"
        description={dialogDescription}
        confirmLabel="Confirm"
        confirmColor={roleToToggle?.status === 'ACTIVE' ? 'warning' : 'primary'}
        onConfirm={handleConfirmStatusChange}
        onClose={() => setRoleToToggle(null)}
      />

      <ManageRoleUsersDialog
        open={Boolean(roleToManage)}
        role={roleToManage}
        onClose={() => setRoleToManage(null)}
      />
    </>
  );
}
