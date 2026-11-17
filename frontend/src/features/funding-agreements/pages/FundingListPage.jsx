import { useMemo, useState } from 'react';
import { Box, Button, FormControl, MenuItem, Select, Stack, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';
import { useNavigate } from 'react-router-dom';
import { ACTIONS, PermissionGate } from '../../../core/permissions/index.js';
import { DataTable, PageHeader, SearchField, StatusChip } from '../../../shared/components/index.js';
import { formatDate } from '../../../lib/format/date.js';
import { formatInr } from '../../../lib/format/currency.js';
import { FUND_CLASS_CODE_LABEL, FUND_CLASS_CODE_TONE } from '../../donor-management/constants.js';
import { useFundingRecords } from '../hooks/useFunding.js';
import { StagePipeline } from '../components/StagePipeline.jsx';
import { STAGE_BY_KEY, codeSortValue, matchesSearch } from '../lib/fundingRecords.js';
import { CLASS_NAME, MODULE_ID } from '../constants.js';

const CLASS_FILTER_OPTIONS = [
  { value: 'all', label: 'All classes' },
  { value: 'A', label: 'Class A – Restricted' },
  { value: 'B', label: 'Class B · Unrestricted w/ explanation' },
  { value: 'C', label: 'Class C · Fully unrestricted' },
  { value: 'none', label: 'Class not set' },
];

const selectSx = { height: 38, borderRadius: 1.5, fontSize: 13, fontWeight: 500, bgcolor: 'background.paper' };

const columns = [
  {
    key: 'code',
    header: 'Funding',
    width: 200,
    sortValue: codeSortValue,
    render: (row) => (
      <Box>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, whiteSpace: 'nowrap' }}>
          {row.profileCode || row.grantCode}
        </Typography>
        {row.profileCode && row.grantCode ? (
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
            <LinkIcon sx={{ fontSize: 14 }} />
            <Typography variant="caption" sx={{ fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
              {row.grantCode}
            </Typography>
          </Stack>
        ) : row.profileCode ? (
          <Typography variant="caption" sx={{ color: 'var(--warn)', whiteSpace: 'nowrap' }}>
            No agreement yet
          </Typography>
        ) : (
          <Typography variant="caption" color="text.disabled">
            No fund profile linked
          </Typography>
        )}
      </Box>
    ),
  },
  {
    key: 'title',
    header: 'Agreement / Donor',
    sortValue: (row) => row.title || row.donorName,
    render: (row) => (
      <Box sx={{ minWidth: 200, maxWidth: 380 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            color: row.title ? 'text.primary' : 'text.disabled',
          }}
        >
          {row.title || 'No purpose recorded'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {row.donorName}
          {row.programmeName ? ` · ${row.programmeName}` : ''}
        </Typography>
      </Box>
    ),
  },
  {
    key: 'class',
    header: 'Class',
    width: 150,
    sortValue: (row) => row.classCode,
    render: (row) =>
      row.classCode ? (
        <Tooltip title={FUND_CLASS_CODE_LABEL[row.classCode]}>
          <span>
            <StatusChip label={`${row.classCode} · ${CLASS_NAME[row.classCode]}`} tone={FUND_CLASS_CODE_TONE[row.classCode]} />
          </span>
        </Tooltip>
      ) : (
        <StatusChip label="Not set" tone="neutral" />
      ),
  },
  {
    key: 'period',
    header: 'Period',
    sx: { whiteSpace: 'nowrap' },
    sortValue: (row) => row.startDate,
    render: (row) =>
      row.startDate ? (
        <>
          <Typography variant="body2" sx={{ lineHeight: 1.35 }}>
            {formatDate(row.startDate)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            to {formatDate(row.endDate)}
          </Typography>
        </>
      ) : (
        <Typography variant="caption" color="text.disabled">
          Set on agreement
        </Typography>
      ),
  },
  {
    key: 'committed',
    header: 'Committed',
    align: 'right',
    width: 130,
    sortValue: (row) => (row.hasSchedule ? row.committed : null),
    render: (row) =>
      row.hasSchedule ? (
        <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
          {formatInr(row.committed)}
        </Typography>
      ) : (
        <Typography variant="caption" color="text.disabled">
          No schedule yet
        </Typography>
      ),
  },
  {
    key: 'stage',
    header: 'Stage',
    width: 150,
    sortValue: (row) => row.stage,
    render: (row) => <StatusChip label={STAGE_BY_KEY[row.stage].label} tone={STAGE_BY_KEY[row.stage].tone} />,
  },
];

/** Unified register of fund profiles and their grant agreements — /funding. */
export function FundingListPage() {
  const navigate = useNavigate();
  const { records, isPending, error, refetch } = useFundingRecords();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');

  const rows = useMemo(
    () =>
      records.filter((r) => {
        if (stageFilter !== 'all' && r.stage !== stageFilter) return false;
        if (classFilter !== 'all' && (r.classCode || 'none') !== classFilter) return false;
        return matchesSearch(r, search);
      }),
    [records, search, stageFilter, classFilter],
  );

  const filtered = Boolean(search.trim()) || stageFilter !== 'all' || classFilter !== 'all';
  const clearFilters = () => {
    setSearch('');
    setStageFilter('all');
    setClassFilter('all');
  };

  return (
    <>
      <PageHeader
        title="Funding Agreements"
        subtitle="Each donor's terms and the grant agreement signed on them, tracked as one record from first draft to completion."
        actions={
          <PermissionGate action={ACTIONS.EDIT} moduleId={MODULE_ID}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/funding/new')}>
              New funding
            </Button>
          </PermissionGate>
        }
      />

      {records.length ? (
        <StagePipeline records={records} activeStage={stageFilter} onStageClick={setStageFilter} />
      ) : null}

      <Stack direction="row" spacing={1.5} useFlexGap sx={{ mb: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ maxWidth: 380, flex: 1, minWidth: 240 }}>
          <SearchField value={search} onChange={setSearch} placeholder="Search code, donor, agreement or programme…" />
        </Box>
        <FormControl size="small" sx={{ minWidth: 190 }}>
          <Select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} sx={selectSx} inputProps={{ 'aria-label': 'Restriction class' }}>
            {CLASS_FILTER_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 13 }}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {filtered ? (
          <Button size="small" color="inherit" onClick={clearFilters}>
            Clear filters
          </Button>
        ) : null}
        <Typography variant="caption" color="text.secondary" sx={{ ml: { sm: 'auto' } }}>
          Showing {rows.length} of {records.length}
        </Typography>
      </Stack>

      <DataTable
        dense
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.key}
        defaultSort={{ key: 'code', direction: 'desc' }}
        isLoading={isPending && !records.length}
        error={error}
        onRetry={refetch}
        emptyTitle={filtered ? 'Nothing matches these filters' : 'No funding recorded yet'}
        emptyDescription={
          filtered
            ? 'Try a different search, stage or class — or clear the filters.'
            : 'Use “New funding” to record a donor’s terms and the agreement signed on them in one form.'
        }
        onRowClick={(row) => navigate(row.href)}
      />

    </>
  );
}
