import { useState } from 'react';
import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { ACTIONS, PermissionGate } from '../../../core/permissions/index.js';
import { DataTable, PageHeader, SearchField, StatusChip } from '../../../shared/components/index.js';
import { useDonors } from '../hooks/useDonors.js';
import {
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
];

/** Donor register — /donors. */
export function DonorsListPage() {
  const [search, setSearch] = useState('');
  const donorsQuery = useDonors(search);
  const navigate = useNavigate();

  const rows = (donorsQuery.data || [])
    .map((donor, index) => ({ ...donor, serialNo: index + 1 }));

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
