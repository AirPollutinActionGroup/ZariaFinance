import { useMemo, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  ButtonBase,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LinkIcon from '@mui/icons-material/Link';
import { useNavigate } from 'react-router-dom';
import { ACTIONS, PermissionGate } from '../../../core/permissions/index.js';
import { DataTable, PageHeader, SearchField, StatusChip } from '../../../shared/components/index.js';
import { formatInr } from '../../../lib/format/currency.js';
import { plural } from '../../credit-notes/components/CreditSummaryCard.jsx';
import { useAllFundProfiles } from '../hooks/useFundProfiles.js';
import { useDonors } from '../hooks/useDonors.js';
import { FUND_CLASS_CODE_LABEL, FUND_CLASS_CODE_TONE, FUND_CLASS_SHORT, MODULE_ID } from '../constants.js';

/** One-line, plain-language meaning of each restriction class (full text in FUND_CLASS_CODE_LABEL). */
const CLASS_MEANING = {
  A: 'Locked to one project and its approved budget — no moving money between budget lines.',
  B: 'Can move between budget lines, but every move needs a written explanation.',
  C: 'Free to use on any programme or running cost.',
};

const CLASS_NAME = { A: 'Fully restricted', B: 'Flexible', C: 'Free to use' };

/** MUI palette path for each class's tone — used for the coloured dots and bars. */
const CLASS_COLOR = { A: 'error.main', B: 'warning.main', C: 'success.main', none: 'text.disabled' };

const selectSx = {
  height: 38,
  borderRadius: 1.5,
  fontSize: 13,
  fontWeight: 500,
  bgcolor: 'background.paper',
};

const CLASS_FILTER_OPTIONS = [
  { value: 'all', label: 'All classes' },
  { value: 'A', label: 'Class A · Fully restricted' },
  { value: 'B', label: 'Class B · Flexible' },
  { value: 'C', label: 'Class C · Unrestricted' },
  { value: 'none', label: 'Class not set' },
];

const USAGE_FILTER_OPTIONS = [
  { value: 'all', label: 'All profiles' },
  { value: 'available', label: 'Available for a grant' },
  { value: 'assigned', label: 'Already backing a grant' },
];

const MODE_FILTER_OPTIONS = [
  { value: 'all', label: 'Any mode' },
  { value: 'RESTRICTED', label: 'Restricted' },
  { value: 'UNRESTRICTED', label: 'Unrestricted' },
];

const classOf = (profile) => FUND_CLASS_SHORT[profile.fundClass] || 'none';

/** Committed total of a profile — the sum of its disbursement rules. */
function committedTotal(profile) {
  return profile.disbursementRules.reduce((sum, rule) => sum + (Number(rule.totalAmount) || 0), 0);
}

/** FP-2026-014 → 20260014, so codes sort newest-first numerically (FP-2026-1000 after FP-2026-999). */
function codeSortValue(profile) {
  const match = /^FP-(\d{4})-(\d+)$/.exec(profile.profileCode || '');
  return match ? Number(match[1]) * 1_000_000 + Number(match[2]) : null;
}

function HeaderWithHint({ label, hint }) {
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
      {label}
      <Tooltip title={hint}>
        <InfoOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary', cursor: 'help' }} />
      </Tooltip>
    </Box>
  );
}

/** One-line restriction chip, e.g. "C · Free to use"; the full definition is in the tooltip. */
function ClassChip({ code, modeLabel }) {
  if (code === 'none') {
    return (
      <Tooltip title={`No restriction class set yet (fund mode: ${modeLabel}). Edit the profile to choose A, B or C.`}>
        <span>
          <StatusChip label="Not set" tone="neutral" />
        </span>
      </Tooltip>
    );
  }
  return (
    <Tooltip title={FUND_CLASS_CODE_LABEL[code]}>
      <span>
        <StatusChip label={`${code} · ${CLASS_NAME[code]}`} tone={FUND_CLASS_CODE_TONE[code]} />
      </span>
    </Tooltip>
  );
}

const columns = [
  {
    key: 'profileCode',
    header: 'Profile',
    width: 210,
    sortValue: codeSortValue,
    render: (row) => (
      <Box>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, whiteSpace: 'nowrap' }}>
          {row.profileCode}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.35 }}>
          {row.donorName}
        </Typography>
      </Box>
    ),
  },
  {
    key: 'restriction',
    header: (
      <HeaderWithHint
        label="Restriction"
        hint="How tightly the donor controls the money. Class A is the strictest, Class C the most flexible. Hover a chip for the full definition."
      />
    ),
    width: 170,
    sortValue: (row) => (classOf(row) === 'none' ? null : classOf(row)),
    render: (row) => <ClassChip code={classOf(row)} modeLabel={row.fundModeLabel} />,
  },
  {
    key: 'purpose',
    header: 'Purpose & programme',
    render: (row) => (
      <Box sx={{ minWidth: 220, maxWidth: 420 }}>
        <Tooltip title={row.purpose && row.purpose.length > 90 ? row.purpose : ''} placement="top-start">
          <Typography
            variant="body2"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              color: row.purpose ? 'text.primary' : 'text.disabled',
            }}
          >
            {row.purpose || 'No purpose recorded'}
          </Typography>
        </Tooltip>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
          {row.programmeName ? `Programme: ${row.programmeName}` : 'Not tied to a programme'}
        </Typography>
      </Box>
    ),
  },
  {
    key: 'committed',
    header: (
      <HeaderWithHint
        label="Committed"
        hint="Total the donor has committed under this profile's disbursement schedule."
      />
    ),
    align: 'right',
    width: 140,
    sortValue: (row) => (row.disbursementRules.length ? committedTotal(row) : null),
    render: (row) =>
      row.disbursementRules.length ? (
        <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          {formatInr(committedTotal(row))}
        </Typography>
      ) : (
        <Typography variant="caption" color="text.disabled">
          No schedule yet
        </Typography>
      ),
  },
  {
    key: 'assignedGrantCode',
    header: (
      <HeaderWithHint
        label="Used by"
        hint="A fund profile can back only one grant agreement. “Available” profiles can be picked when creating a new grant."
      />
    ),
    width: 190,
    sortValue: (row) => row.assignedGrantCode || null,
    render: (row) =>
      row.assignedGrantCode ? (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <LinkIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12.5 }}>
            {row.assignedGrantCode}
          </Typography>
        </Stack>
      ) : (
        <StatusChip label="Available" tone="success" />
      ),
  },
];

/** One KPI in the summary strip: small label, then value + hint on one line. */
function Stat({ label, value, hint, hintColor = 'text.secondary' }) {
  return (
    <Box sx={{ px: 2.5, py: 1.5, minWidth: 0 }}>
      <Typography
        variant="caption"
        sx={{ display: 'block', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 10.5, fontWeight: 600 }}
      >
        {label}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', mt: 0.25 }}>
        <Typography sx={{ fontSize: 21, fontWeight: 700, fontVariantNumeric: 'tabular-nums', lineHeight: 1.25 }}>
          {value}
        </Typography>
        {hint ? (
          <Typography variant="caption" sx={{ color: hintColor, whiteSpace: 'nowrap' }}>
            {hint}
          </Typography>
        ) : null}
      </Stack>
    </Box>
  );
}

const CLASS_ORDER = ['A', 'B', 'C', 'none'];

/** Clickable "● A 3" pill — clicking filters the table to that class (click again to clear). */
function ClassPill({ code, count, active, onClick }) {
  const label = code === 'none' ? 'Not set' : `Class ${code}`;
  return (
    <Tooltip title={code === 'none' ? 'No restriction class chosen yet' : `${CLASS_NAME[code]} — ${CLASS_MEANING[code]}`}>
      <ButtonBase
        onClick={onClick}
        sx={{
          gap: 0.75,
          px: 1,
          py: 0.4,
          borderRadius: 999,
          border: '1px solid',
          borderColor: active ? 'text.primary' : 'divider',
          bgcolor: active ? 'action.selected' : 'transparent',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: CLASS_COLOR[code] }} />
        <Typography sx={{ fontSize: 12.5, fontWeight: 500 }}>{label}</Typography>
        <Typography sx={{ fontSize: 12.5, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{count}</Typography>
      </ButtonBase>
    </Tooltip>
  );
}

/** Slim KPI strip. Figures always describe the whole register, not the filtered view. */
function FundProfilesSummary({ profiles, classFilter, onClassClick }) {
  const total = profiles.length;
  const donorCount = new Set(profiles.map((p) => p.donorId)).size;
  const committed = profiles.reduce((sum, p) => sum + committedTotal(p), 0);
  const withoutSchedule = profiles.filter((p) => !p.disbursementRules.length).length;
  const available = profiles.filter((p) => !p.assignedGrantCode).length;
  const byClass = profiles.reduce((acc, p) => {
    const code = classOf(p);
    acc[code] = (acc[code] || 0) + 1;
    return acc;
  }, {});

  return (
    <Card sx={{ mb: 2.5, overflow: 'hidden' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', lg: 'auto auto auto 1fr' },
          '& > *': { borderColor: 'divider' },
          '& > *:not(:last-of-type)': { borderRight: { lg: '1px solid' } },
        }}
      >
        <Stat label="Fund profiles" value={total} hint={`from ${plural(donorCount, 'donor')}`} />
        <Stat
          label="Committed"
          value={formatInr(committed)}
          hint={withoutSchedule ? `${withoutSchedule} without a schedule` : 'all scheduled'}
          hintColor={withoutSchedule ? 'var(--warn)' : 'text.secondary'}
        />
        <Stat label="Available for a grant" value={available} hint={`${total - available} already linked`} />

        <Box sx={{ px: 2.5, py: 1.5, minWidth: 0, gridColumn: { xs: '1 / -1', lg: 'auto' }, borderTop: { xs: '1px solid', lg: 'none' }, borderColor: 'divider' }}>
          <Typography
            variant="caption"
            sx={{ display: 'block', color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 10.5, fontWeight: 600, mb: 0.75 }}
          >
            By restriction class · click to filter
          </Typography>
          <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
            {CLASS_ORDER.map((code) => (
              <ClassPill
                key={code}
                code={code}
                count={byClass[code] || 0}
                active={classFilter === code}
                onClick={() => onClassClick(classFilter === code ? 'all' : code)}
              />
            ))}
            <Stack
              direction="row"
              sx={{ flex: 1, minWidth: 80, height: 6, borderRadius: 3, overflow: 'hidden', gap: '2px', ml: 0.5 }}
            >
              {CLASS_ORDER.filter((code) => byClass[code]).map((code) => (
                <Box key={code} sx={{ flexGrow: byClass[code], flexBasis: 0, bgcolor: CLASS_COLOR[code] }} />
              ))}
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Card>
  );
}

/** Picks the donor a new fund profile will belong to, then opens the form. */
function NewProfileDialog({ open, onClose }) {
  const navigate = useNavigate();
  const donorsQuery = useDonors();
  const [donor, setDonor] = useState(null);

  const handleClose = () => {
    setDonor(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>New fund profile</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Which donor's money does this profile describe? You'll set the restriction class, spending rules
          and disbursement schedule on the next screen.
        </Typography>
        <Autocomplete
          options={donorsQuery.data || []}
          loading={donorsQuery.isPending}
          value={donor}
          onChange={(_event, value) => setDonor(value)}
          getOptionLabel={(option) =>
            option.donorCode ? `${option.donorName} (${option.donorCode})` : option.donorName || ''
          }
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={(params) => <TextField {...params} label="Donor" autoFocus />}
        />
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!donor}
          onClick={() => navigate(`/donors/${donor.id}/fund-profiles/new`)}
        >
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/** Register of every donor fund profile — /fund-profiles. */
export function FundProfilesListPage() {
  const navigate = useNavigate();
  const query = useAllFundProfiles();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [usageFilter, setUsageFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  const profiles = useMemo(() => query.data || [], [query.data]);

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return profiles.filter((profile) => {
      if (classFilter !== 'all' && classOf(profile) !== classFilter) return false;
      if (modeFilter !== 'all' && profile.fundMode !== modeFilter) return false;
      if (usageFilter === 'assigned' && !profile.assignedGrantCode) return false;
      if (usageFilter === 'available' && profile.assignedGrantCode) return false;
      if (!term) return true;
      return [profile.profileCode, profile.donorName, profile.purpose, profile.programmeName, profile.assignedGrantCode]
        .some((value) => value && value.toLowerCase().includes(term));
    });
  }, [profiles, search, classFilter, modeFilter, usageFilter]);

  const filtered = Boolean(search.trim()) || classFilter !== 'all' || modeFilter !== 'all' || usageFilter !== 'all';
  const clearFilters = () => {
    setSearch('');
    setClassFilter('all');
    setModeFilter('all');
    setUsageFilter('all');
  };

  const filters = [
    { key: 'class', value: classFilter, onChange: setClassFilter, options: CLASS_FILTER_OPTIONS },
    { key: 'usage', value: usageFilter, onChange: setUsageFilter, options: USAGE_FILTER_OPTIONS },
    { key: 'mode', value: modeFilter, onChange: setModeFilter, options: MODE_FILTER_OPTIONS },
  ];

  return (
    <>
      <PageHeader
        title="Fund Profiles"
        subtitle="The conditions each donor attached to their money: how restricted it is, what it may be spent on, and when it arrives. Every grant is built on one."
        actions={
          <PermissionGate action={ACTIONS.EDIT} moduleId={MODULE_ID}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
              New fund profile
            </Button>
          </PermissionGate>
        }
      />

      {profiles.length ? (
        <FundProfilesSummary profiles={profiles} classFilter={classFilter} onClassClick={setClassFilter} />
      ) : null}

      <Stack direction="row" spacing={1.5} useFlexGap sx={{ mb: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ maxWidth: 380, flex: 1, minWidth: 240 }}>
          <SearchField value={search} onChange={setSearch} placeholder="Search code, donor, purpose or grant…" />
        </Box>
        {filters.map((filter) => (
          <FormControl key={filter.key} size="small" sx={{ minWidth: 160 }}>
            <Select value={filter.value} onChange={(e) => filter.onChange(e.target.value)} sx={selectSx}>
              {filter.options.map((opt) => (
                <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 13 }}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}
      </Stack>

      {profiles.length ? (
        <Stack direction="row" spacing={1} sx={{ mb: 1.5, alignItems: 'center', minHeight: 28 }}>
          <Typography variant="caption" color="text.secondary">
            Showing {rows.length} of {plural(profiles.length, 'profile')} · newest first · click a row to see its full rules
          </Typography>
          {filtered ? (
            <Button size="small" color="inherit" onClick={clearFilters} sx={{ py: 0, minHeight: 0 }}>
              Clear filters
            </Button>
          ) : null}
        </Stack>
      ) : null}

      <DataTable
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.id}
        defaultSort={{ key: 'profileCode', direction: 'desc' }}
        isLoading={query.isPending}
        error={query.isError ? query.error : null}
        onRetry={query.refetch}
        emptyTitle={filtered ? 'No fund profiles match these filters' : 'No fund profiles yet'}
        emptyDescription={
          filtered
            ? 'Try a different search or clear the filters.'
            : 'A fund profile defines how a donor’s money may be used. Create one to back a grant agreement.'
        }
        onRowClick={(row) => navigate(`/fund-profiles/${row.id}`)}
      />
      <NewProfileDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
}
