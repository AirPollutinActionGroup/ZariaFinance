import { useState } from 'react';
import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { ACTIONS, PermissionGate } from '../../../core/permissions/index.js';
import { DataTable, PageHeader, SearchField, StatusChip } from '../../../shared/components/index.js';
import { useDonors } from '../hooks/useDonors.js';
import {
  DONOR_STATUS_TONE,
  FUND_CLASS_TONE,
  MODULE_ID,
} from '../constants.js';

const columns = [
  { key: 'donorCode', header: 'Code', width: 110 },
  { key: 'donorName', header: 'Donor' },
  { key: 'donorType', header: 'Type' },
  {
    key: 'fundClass',
    header: 'Fund class',
    render: (row) => <StatusChip label={row.fundClassLabel} tone={FUND_CLASS_TONE[row.fundClass] || 'neutral'} />,
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <StatusChip label={row.statusLabel} tone={DONOR_STATUS_TONE[row.status] || 'neutral'} />,
  },
];

/** Donor register — /donors. */
export function DonorsListPage() {
  const [search, setSearch] = useState('');
  const donorsQuery = useDonors(search);
  const navigate = useNavigate();

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
      <Box sx={{ mb: 2, maxWidth: 420 }}>
        <SearchField value={search} onChange={setSearch} placeholder="Search donors…" />
      </Box>
      <DataTable
        columns={columns}
        rows={donorsQuery.data || []}
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
