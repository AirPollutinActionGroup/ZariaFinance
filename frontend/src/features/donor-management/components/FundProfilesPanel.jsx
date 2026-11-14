import { Box, Button, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useNavigate } from 'react-router-dom';
import { DataTable, StatusChip } from '../../../shared/components/index.js';
import { ACTIONS, PermissionGate } from '../../../core/permissions/index.js';
import { useFundProfilesByDonor } from '../hooks/useFundProfiles.js';
import { FUND_CLASS_CODE_TONE, FUND_CLASS_SHORT, MODULE_ID } from '../constants.js';

const columns = [
  { key: 'profileCode', header: 'Code', width: 120, sx: { whiteSpace: 'nowrap' } },
  {
    key: 'fundClass',
    header: 'Fund Class',
    width: 90,
    render: (row) => {
      const short = FUND_CLASS_SHORT[row.fundClass];
      return short ? <StatusChip label={short} tone={FUND_CLASS_CODE_TONE[short] || 'neutral'} /> : '—';
    },
  },
  { key: 'fundMode', header: 'Mode', render: (row) => row.fundModeLabel },
  {
    key: 'purpose',
    header: 'Purpose',
    // Full description shown even when it exceeds 50 words: wrap within a capped
    // width so long text never overflows or breaks the table layout (issue #21, item 8).
    render: (row) => (
      <Box sx={{ minWidth: 140, maxWidth: 320, whiteSpace: 'normal', wordBreak: 'break-word' }}>
        {row.purpose || '—'}
      </Box>
    ),
  },
  { key: 'programmeName', header: 'Programme', sx: { minWidth: 150 }, render: (row) => row.programmeName || 'Untied' },
  {
    key: 'reportingFrequency',
    header: (
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
        Reporting
        <Tooltip title="How often the organisation must submit progress and utilisation reports to the donor for this fund profile (e.g. Quarterly, Half-yearly, Annual).">
          <InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary', cursor: 'help' }} />
        </Tooltip>
      </Box>
    ),
    render: (row) => row.reportingFrequencyLabel || row.reportingFrequency || '—',
  },
  {
    key: 'rules',
    header: 'Rules',
    render: (row) => (
      <Tooltip title="Geography · utilisation · disbursement rules">
        <Box
          component="span"
          sx={{ display: 'inline-flex', flexWrap: 'wrap', columnGap: 0.75, color: 'text.secondary', fontSize: 12 }}
        >
          {[
            `${row.geographies.length} geo`,
            `${row.utilisationRules.length} util`,
            `${row.disbursementRules.length} disb`,
          ].map((part) => (
            <Box component="span" key={part} sx={{ whiteSpace: 'nowrap' }}>
              {part}
            </Box>
          ))}
        </Box>
      </Tooltip>
    ),
  },
];

/** Fund-profile list for a donor, embedded on the donor detail page. */
export function FundProfilesPanel({ donorId }) {
  const navigate = useNavigate();
  const query = useFundProfilesByDonor(donorId);

  const rows = query.data || [];

  return (
    <DataTable
      dense
      title={rows.length ? `Fund profiles · ${rows.length}` : 'Fund profiles'}
      actions={
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
      }
      columns={columns}
      rows={rows}
      getRowKey={(row) => row.id}
      isLoading={query.isPending}
      error={query.isError ? query.error : null}
      onRetry={query.refetch}
      emptyTitle="No fund profiles yet"
      emptyDescription="A fund profile defines how this donor's money may be used — mode, class, movement and reporting rules."
      onRowClick={(row) => navigate(`/fund-profiles/${row.id}`)}
    />
  );
}
