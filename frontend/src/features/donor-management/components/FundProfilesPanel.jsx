import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { DataTable, StatusChip } from '../../../shared/components/index.js';
import { ACTIONS, PermissionGate } from '../../../core/permissions/index.js';
import { useFundProfilesByDonor } from '../hooks/useFundProfiles.js';
import { MODULE_ID } from '../constants.js';

const CLASS_TONE = { A: 'error', B: 'warning', C: 'success' };

const columns = [
  {
    key: 'fundClassCode',
    header: 'Class',
    width: 90,
    render: (row) =>
      row.fundClassCode ? (
        <StatusChip label={row.fundClassCode} tone={CLASS_TONE[row.fundClassCode] || 'neutral'} />
      ) : (
        '—'
      ),
  },
  { key: 'fundMode', header: 'Mode', render: (row) => row.fundModeLabel },
  { key: 'purpose', header: 'Purpose', render: (row) => row.purpose || '—' },
  { key: 'programmeName', header: 'Programme', render: (row) => row.programmeName || 'Untied' },
  { key: 'reportingFrequency', header: 'Reporting', render: (row) => row.reportingFrequency || '—' },
  {
    key: 'overheadLimitPercent',
    header: 'Overhead cap',
    align: 'right',
    render: (row) => (row.overheadLimitPercent != null ? `${row.overheadLimitPercent}%` : '—'),
  },
  {
    key: 'rules',
    header: 'Rules',
    render: (row) => (
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        <Chip size="small" variant="outlined" label={`${row.geographies.length} geo`} />
        <Chip size="small" variant="outlined" label={`${row.utilisationRules.length} util`} />
        <Chip size="small" variant="outlined" label={`${row.disbursementRules.length} disb`} />
      </Box>
    ),
  },
];

/** Fund-profile list for a donor, embedded on the donor detail page. */
export function FundProfilesPanel({ donorId }) {
  const navigate = useNavigate();
  const query = useFundProfilesByDonor(donorId);

  return (
    <Box>
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}
      >
        <Typography variant="h4" component="h2">
          Fund profiles
        </Typography>
        <PermissionGate action={ACTIONS.EDIT} moduleId={MODULE_ID}>
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(`/donors/${donorId}/fund-profiles/new`)}
          >
            Add fund profile
          </Button>
        </PermissionGate>
      </Stack>
      <DataTable
        columns={columns}
        rows={query.data || []}
        getRowKey={(row) => row.id}
        isLoading={query.isPending}
        error={query.isError ? query.error : null}
        onRetry={query.refetch}
        emptyTitle="No fund profiles yet"
        emptyDescription="A fund profile defines how this donor's money may be used — mode, class, movement and reporting rules."
        onRowClick={(row) => navigate(`/fund-profiles/${row.id}/edit`)}
      />
    </Box>
  );
}
