import { useMemo, useState } from 'react';
import { Box, Button, FormControl, MenuItem, Select, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { ACTIONS, PermissionGate } from '../../../core/permissions/index.js';
import { DataTable, PageHeader, SearchField, StatusChip } from '../../../shared/components/index.js';
import { useProgrammes } from '../hooks/useProgrammes.js';
import { MODULE_ID } from '../constants.js';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const columns = [
  { key: 'programmeCode', header: 'Code', width: 130 },
  { key: 'programmeName', header: 'Name' },
  { key: 'description', header: 'Description', render: (row) => row.description || '—' },
  {
    key: 'isActive',
    header: 'Status',
    render: (row) => (
      <StatusChip label={row.isActive ? 'Active' : 'Inactive'} tone={row.isActive ? 'success' : 'neutral'} />
    ),
  },
];

/** Programme index — /programmes. */
export function ProgrammesListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const programmesQuery = useProgrammes();
  const navigate = useNavigate();

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (programmesQuery.data || []).filter((programme) => {
      if (statusFilter === 'active' && !programme.isActive) return false;
      if (statusFilter === 'inactive' && programme.isActive) return false;
      if (!term) return true;
      return (
        programme.programmeCode?.toLowerCase().includes(term) ||
        programme.programmeName?.toLowerCase().includes(term)
      );
    });
  }, [programmesQuery.data, search, statusFilter]);

  return (
    <>
      <PageHeader
        title="Programmes"
        subtitle="Programmes donations and grants can be tied to"
        actions={
          <PermissionGate action={ACTIONS.EDIT} moduleId={MODULE_ID}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/programmes/new')}>
              New programme
            </Button>
          </PermissionGate>
        }
      />
      <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ maxWidth: 420, flex: 1, minWidth: 240 }}>
          <SearchField value={search} onChange={setSearch} placeholder="Search programmes…" />
        </Box>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{
              height: 38,
              borderRadius: 1.5,
              fontSize: 13,
              fontWeight: 500,
              bgcolor: 'background.paper',
            }}
          >
            {STATUS_OPTIONS.map((opt) => (
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
        isLoading={programmesQuery.isPending}
        error={programmesQuery.isError ? programmesQuery.error : null}
        onRetry={programmesQuery.refetch}
        emptyTitle="No programmes"
        emptyDescription="Create a programme to start tying donations and grants to it."
        onRowClick={(row) => navigate(`/programmes/${row.id}`)}
      />
    </>
  );
}
