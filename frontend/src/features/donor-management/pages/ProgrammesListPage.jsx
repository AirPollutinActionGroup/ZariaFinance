import { useMemo, useState } from 'react';
import { Box, Button, Chip, IconButton, MenuItem, Select, Stack, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate } from 'react-router-dom';
import { ACTIONS, PermissionGate } from '../../../core/permissions/index.js';
import { DataTable, PageHeader, SearchField, StatStrip, StatusChip } from '../../../shared/components/index.js';
import { formatDate } from '../../../lib/format/date.js';
import { useProgrammes } from '../hooks/useProgrammes.js';
import { MODULE_ID, PROGRAMME_STATUS_TONE, PROGRAMME_STATUSES } from '../constants.js';

/** Values: 'all' | 'programme' | 'project'. */
const TYPE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'programme', label: 'Programmes' },
  { value: 'project', label: 'Projects' },
];

const isProject = (p) => p.type === 'Project';

/** Name cell: expand toggle for a programme, an indented tree branch for a project. */
function NameCell({ row, expanded, onToggle }) {
  const record = row.record;
  const title = (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="body2" sx={{ fontWeight: row.kind === 'programme' ? 600 : 500, lineHeight: 1.35 }}>
        {record.programmeName}
      </Typography>
      {record.description ? (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            maxWidth: 520,
          }}
        >
          {record.description}
        </Typography>
      ) : null}
    </Box>
  );

  if (row.kind === 'project') {
    return (
      <Stack direction="row" alignItems="center" sx={{ minWidth: 240 }}>
        {/* Tree branch: a vertical line from the parent and a short elbow into this row. */}
        <Box
          aria-hidden
          sx={{
            position: 'relative',
            alignSelf: 'stretch',
            width: 40,
            flexShrink: 0,
            my: -1,
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 13,
              top: 0,
              bottom: row.lastChild ? '50%' : 0,
              borderLeft: '1.5px solid',
              borderColor: 'divider',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              left: 13,
              top: '50%',
              width: 16,
              borderTop: '1.5px solid',
              borderColor: 'divider',
            },
          }}
        />
        {title}
      </Stack>
    );
  }

  return (
    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 240 }}>
      <Box sx={{ width: 28, flexShrink: 0 }}>
        {row.childCount ? (
          <IconButton
            size="small"
            aria-label={expanded ? `Hide projects of ${record.programmeName}` : `Show projects of ${record.programmeName}`}
            aria-expanded={expanded}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(record.id);
            }}
          >
            {expanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
          </IconButton>
        ) : null}
      </Box>
      {title}
    </Stack>
  );
}

function periodCell(record) {
  if (!record.startDate && !record.endDate) return <Typography variant="body2" color="text.disabled">—</Typography>;
  return (
    <Box sx={{ whiteSpace: 'nowrap', fontSize: 12.5, lineHeight: 1.45 }}>
      <Box>{record.startDate ? formatDate(record.startDate) : '—'}</Box>
      <Box sx={{ color: 'text.secondary' }}>to {record.endDate ? formatDate(record.endDate) : '—'}</Box>
    </Box>
  );
}

function statesCell(record) {
  const states = record.stateNames || [];
  if (!states.length) return <Typography variant="body2" color="text.disabled">—</Typography>;
  const shown = states.slice(0, 2);
  const rest = states.length - shown.length;
  return (
    <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
      {shown.map((name) => (
        <Chip key={name} label={name} size="small" variant="outlined" sx={{ fontSize: 11, height: 22 }} />
      ))}
      {rest > 0 ? (
        <Tooltip title={states.slice(2).join(', ')}>
          <Chip label={`+${rest}`} size="small" sx={{ fontSize: 11, height: 22 }} />
        </Tooltip>
      ) : null}
    </Stack>
  );
}

/** Programme index — /programmes. Projects sit indented under their parent programme. */
export function ProgrammesListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  // Programmes start expanded; this holds the ones the user collapsed / re-opened.
  const [expandedOverrides, setExpandedOverrides] = useState({});
  const programmesQuery = useProgrammes();
  const navigate = useNavigate();

  const allProgrammes = useMemo(() => programmesQuery.data || [], [programmesQuery.data]);

  const projectCount = allProgrammes.filter(isProject).length;
  const programmeCount = allProgrammes.length - projectCount;
  const activeCount = allProgrammes.filter((p) => p.status === 'Active').length;
  const onHoldCount = allProgrammes.filter((p) => p.status === 'On Hold').length;

  const { parents, childrenByParent } = useMemo(() => {
    const byParent = new Map();
    const topLevel = [];
    allProgrammes.forEach((p) => {
      if (isProject(p) && p.parentProgrammeId != null) {
        const list = byParent.get(p.parentProgrammeId) || [];
        list.push(p);
        byParent.set(p.parentProgrammeId, list);
      } else {
        topLevel.push(p);
      }
    });
    return { parents: topLevel, childrenByParent: byParent };
  }, [allProgrammes]);

  const term = search.trim().toLowerCase();
  const isExpanded = (id) => expandedOverrides[id] ?? true;
  const toggle = (id) => setExpandedOverrides((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }));

  // Flattened tree: each visible programme, then (when expanded) its visible projects.
  const rows = useMemo(() => {
    const matchesSearch = (p) =>
      !term ||
      p.programmeName.toLowerCase().includes(term) ||
      (p.programmeCode || '').toLowerCase().includes(term);
    const matchesStatus = (p) => statusFilter === 'all' || p.status === statusFilter;
    const out = [];
    let programmeNo = 0;
    parents.forEach((parent) => {
      const allChildren = childrenByParent.get(parent.id) || [];
      const children = typeFilter === 'programme' ? [] : allChildren.filter((c) => matchesSearch(c) && matchesStatus(c));
      const parentMatches = typeFilter !== 'project' && matchesSearch(parent) && matchesStatus(parent);
      if (!parentMatches && children.length === 0) return;
      // S.No: programmes count 1, 2, 3…; their projects 3.1, 3.2…
      const srNo = String(++programmeNo);
      out.push({ key: `p-${parent.id}`, kind: 'programme', record: parent, srNo, childCount: children.length, totalChildren: allChildren.length });
      if (expandedOverrides[parent.id] ?? true) {
        children.forEach((child, index) =>
          out.push({
            key: `c-${child.id}`,
            kind: 'project',
            record: child,
            srNo: `${srNo}.${index + 1}`,
            lastChild: index === children.length - 1,
          }),
        );
      }
    });
    return out;
  }, [parents, childrenByParent, term, statusFilter, typeFilter, expandedOverrides]);

  const columns = [
    {
      key: 'srNo',
      header: 'S.No',
      width: 64,
      align: 'center',
      render: (row) => (
        <Typography
          variant="body2"
          sx={{
            fontVariantNumeric: 'tabular-nums',
            fontWeight: row.kind === 'programme' ? 600 : 400,
            color: row.kind === 'programme' ? 'text.primary' : 'text.secondary',
            fontSize: row.kind === 'programme' ? 13.5 : 12.5,
          }}
        >
          {row.srNo}
        </Typography>
      ),
    },
    {
      key: 'name',
      header: 'Programme / Project',
      render: (row) => <NameCell row={row} expanded={isExpanded(row.record.id)} onToggle={toggle} />,
    },
    {
      key: 'code',
      header: 'Code',
      sx: { whiteSpace: 'nowrap' },
      render: (row) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12.5, color: 'text.secondary' }}>
          {row.record.programmeCode || '—'}
        </Typography>
      ),
    },
    {
      key: 'projects',
      header: 'Projects',
      align: 'center',
      render: (row) =>
        row.kind === 'programme' ? (
          <Typography variant="body2" color={row.totalChildren ? 'text.primary' : 'text.disabled'} sx={{ fontWeight: 600 }}>
            {row.totalChildren}
          </Typography>
        ) : (
          <Typography variant="body2" color="text.disabled">—</Typography>
        ),
    },
    { key: 'states', header: 'States', render: (row) => statesCell(row.record) },
    { key: 'period', header: 'Period', sx: { whiteSpace: 'nowrap' }, render: (row) => periodCell(row.record) },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <StatusChip label={row.record.status} tone={PROGRAMME_STATUS_TONE[row.record.status] || 'neutral'} />
      ),
    },
  ];

  const typeCount = { all: allProgrammes.length, programme: programmeCount, project: projectCount };

  return (
    <>
      <PageHeader
        title="Programmes & Projects"
        subtitle="Every project rolls up to one parent programme"
        actions={
          <PermissionGate action={ACTIONS.EDIT} moduleId={MODULE_ID}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/programmes/new')}>
              Add new
            </Button>
          </PermissionGate>
        }
      />

      {allProgrammes.length ? (
        <StatStrip
          sx={{ mb: 2 }}
          stats={[
            { label: 'Programmes', value: programmeCount },
            { label: 'Projects', value: projectCount },
            { label: 'Active', value: activeCount, color: 'success.main' },
            { label: 'On hold', value: onHoldCount, color: onHoldCount ? 'warning.main' : undefined },
          ]}
        />
      ) : null}

      <Stack direction="row" sx={{ mb: 1.5, gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ width: { xs: '100%', sm: 280 }, mr: { sm: 1 } }}>
          <SearchField value={search} onChange={setSearch} placeholder="Search name or code…" />
        </Box>
        {TYPE_FILTERS.map((f) => {
          const selected = typeFilter === f.value;
          return (
            <Chip
              key={f.value}
              size="small"
              label={`${f.label} · ${typeCount[f.value]}`}
              onClick={() => setTypeFilter(f.value)}
              color={selected ? 'primary' : 'default'}
              variant={selected ? 'filled' : 'outlined'}
              aria-pressed={selected}
            />
          );
        })}
        <Select
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 140, ml: { sm: 'auto' }, '& .MuiSelect-select': { py: 0.75, fontSize: 13.5 } }}
        >
          <MenuItem value="all">Any status</MenuItem>
          {PROGRAMME_STATUSES.map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </Select>
      </Stack>

      <DataTable
        dense
        columns={columns}
        rows={rows}
        getRowKey={(row) => row.key}
        isLoading={programmesQuery.isPending}
        error={programmesQuery.isError ? programmesQuery.error : null}
        onRetry={programmesQuery.refetch}
        emptyTitle={allProgrammes.length === 0 ? 'No programmes' : 'No records match your search or filters'}
        emptyDescription={
          allProgrammes.length === 0 ? 'Create a programme to start tying donations and grants to it.' : 'Try another filter.'
        }
        onRowClick={(row) => navigate(`/programmes/${row.record.id}`)}
      />
    </>
  );
}
