import { useMemo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  Chip,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate } from 'react-router-dom';
import { ACTIONS, PermissionGate } from '../../../core/permissions/index.js';
import { EmptyState, ErrorState, LoadingState, PageHeader, SearchField, StatusChip } from '../../../shared/components/index.js';
import { formatDate } from '../../../lib/format/date.js';
import { useProgrammes } from '../hooks/useProgrammes.js';
import { MODULE_ID, PROGRAMME_STATUS_TONE, PROGRAMME_STATUSES } from '../constants.js';

/** Values: 'all' | 'programme' | 'project'. */
const TYPE_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'programme', label: 'Programmes' },
  { value: 'project', label: 'Projects' },
];

/** Single-strip KPI row — cells divided by a hairline rather than separate cards. */
function StatStrip({ items }) {
  return (
    <Card variant="outlined" sx={{ display: 'flex', flexWrap: 'wrap', mb: 3 }}>
      {items.map((item, index) => (
        <Box
          key={item.label}
          sx={{
            flex: '1 1 140px',
            px: 2.75,
            py: 2,
            borderRight: { xs: 'none', sm: index < items.length - 1 ? '1px solid' : 'none' },
            borderBottom: { xs: index < items.length - 1 ? '1px solid' : 'none', sm: 'none' },
            borderColor: 'divider',
          }}
        >
          <Typography variant="overline" color="text.secondary" sx={{ display: 'block', letterSpacing: '0.06em' }}>
            {item.label}
          </Typography>
          <Typography variant="h4" component="p" sx={{ fontWeight: 700, mt: 0.5, color: item.color || 'text.primary' }}>
            {item.value}
          </Typography>
        </Box>
      ))}
    </Card>
  );
}

function TypeTag({ children, emphasis = false }) {
  return (
    <Box
      component="span"
      sx={{
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: '0.03em',
        px: 0.9,
        py: 0.4,
        borderRadius: 0.75,
        flexShrink: 0,
        bgcolor: emphasis ? 'text.primary' : 'action.hover',
        color: emphasis ? 'background.paper' : 'text.secondary',
      }}
    >
      {children}
    </Box>
  );
}

function dateRange(startDate, endDate) {
  if (!startDate && !endDate) return null;
  if (startDate && endDate) return `${formatDate(startDate)} – ${formatDate(endDate)}`;
  return formatDate(startDate || endDate);
}

/** Shared meta cluster: state tags, date range, status chip, view button. */
function MetaCluster({ record, onView }) {
  const range = dateRange(record.startDate, record.endDate);
  const states = record.stateNames || [];
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ ml: 'auto', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
      <Stack direction="row" spacing={0.5} sx={{ display: { xs: 'none', md: 'flex' } }}>
        {states.slice(0, 2).map((name) => (
          <Chip key={name} label={name} size="small" variant="outlined" sx={{ fontSize: 11 }} />
        ))}
      </Stack>
      {range ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', lg: 'block' }, whiteSpace: 'nowrap' }}>
          {range}
        </Typography>
      ) : null}
      <StatusChip label={record.status} tone={PROGRAMME_STATUS_TONE[record.status] || 'neutral'} />
      {/* A plain element, not <IconButton> — this cluster sits inside the parent
          row's AccordionSummary, which is itself a <button>; nesting a real
          <button> inside another is invalid HTML and breaks hydration. */}
      <Box
        component="span"
        role="button"
        tabIndex={0}
        aria-label={`View ${record.programmeName}`}
        onClick={() => onView(record.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onView(record.id);
          }
        }}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          borderRadius: '50%',
          cursor: 'pointer',
          color: 'action.active',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <ChevronRightIcon fontSize="small" />
      </Box>
    </Stack>
  );
}

/** Programme index — /programmes. */
export function ProgrammesListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [expandedOverrides, setExpandedOverrides] = useState({});
  const programmesQuery = useProgrammes();
  const navigate = useNavigate();

  const allProgrammes = useMemo(() => programmesQuery.data || [], [programmesQuery.data]);

  const programmeCount = allProgrammes.filter((p) => p.type !== 'Project').length;
  const projectCount = allProgrammes.length - programmeCount;
  const activeCount = allProgrammes.filter((p) => p.status === 'Active').length;
  const onHoldCount = allProgrammes.filter((p) => p.status === 'On Hold').length;

  const { parents, childrenByParent } = useMemo(() => {
    const byParent = new Map();
    const topLevel = [];
    allProgrammes.forEach((p) => {
      if (p.type === 'Project' && p.parentProgrammeId != null) {
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
  const filtersActive = term !== '' || statusFilter !== 'all';

  const groups = useMemo(() => {
    const matchesSearch = (p) => !term || p.programmeName.toLowerCase().includes(term);
    const matchesStatus = (p) => statusFilter === 'all' || p.status === statusFilter;
    return parents
      .map((parent) => {
        const allChildren = childrenByParent.get(parent.id) || [];
        const visibleChildren = typeFilter === 'programme' ? [] : allChildren.filter((c) => matchesSearch(c) && matchesStatus(c));
        const parentSelfVisible = typeFilter !== 'project' && matchesSearch(parent) && matchesStatus(parent);
        if (!parentSelfVisible && visibleChildren.length === 0) return null;
        return { parent, allChildrenCount: allChildren.length, children: visibleChildren, parentSelfVisible };
      })
      .filter(Boolean);
  }, [parents, childrenByParent, term, statusFilter, typeFilter]);

  const goToDetail = (id) => navigate(`/programmes/${id}`);

  return (
    <>
      <PageHeader
        title="Programmes & projects"
        subtitle="Every project rolls up to one parent programme."
        actions={
          <PermissionGate action={ACTIONS.EDIT} moduleId={MODULE_ID}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/programmes/new')}>
              Add new
            </Button>
          </PermissionGate>
        }
      />

      <StatStrip
        items={[
          { label: 'Programmes', value: programmeCount },
          { label: 'Projects', value: projectCount },
          { label: 'Active', value: activeCount, color: 'success.main' },
          { label: 'On hold', value: onHoldCount },
        ]}
      />

      <Stack direction="row" spacing={2} sx={{ mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ maxWidth: 420, flex: 1, minWidth: 240 }}>
          <SearchField value={search} onChange={setSearch} placeholder="Search programmes or projects…" />
        </Box>
        <ToggleButtonGroup value={typeFilter} exclusive size="small" onChange={(_e, next) => next && setTypeFilter(next)}>
          {TYPE_FILTERS.map((option) => (
            <ToggleButton key={option.value} value={option.value}>
              {option.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Select
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">Any status</MenuItem>
          {PROGRAMME_STATUSES.map((status) => (
            <MenuItem key={status} value={status}>
              {status}
            </MenuItem>
          ))}
        </Select>
      </Stack>

      {programmesQuery.isPending ? <LoadingState label="Loading programmes…" /> : null}
      {programmesQuery.isError ? <ErrorState error={programmesQuery.error} onRetry={programmesQuery.refetch} /> : null}

      {!programmesQuery.isPending && !programmesQuery.isError ? (
        groups.length === 0 ? (
          <EmptyState
            title={allProgrammes.length === 0 ? 'No programmes' : 'No records match your search or filters'}
            description={
              allProgrammes.length === 0 ? 'Create a programme to start tying donations and grants to it.' : undefined
            }
          />
        ) : (
          <Card variant="outlined">
            {groups.map(({ parent, children, allChildrenCount, parentSelfVisible }) => {
              const autoOpen = filtersActive && !parentSelfVisible && children.length > 0;
              const expanded = expandedOverrides[parent.id] ?? autoOpen;
              return (
                <Accordion
                  key={parent.id}
                  disableGutters
                  square
                  expanded={expanded}
                  onChange={(_e, next) => setExpandedOverrides((prev) => ({ ...prev, [parent.id]: next }))}
                  sx={{
                    boxShadow: 'none',
                    '&:before': { display: 'none' },
                    '&:not(:last-of-type)': { borderBottom: '1px solid', borderColor: 'divider' },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%', pr: 1 }}>
                      <TypeTag emphasis>PROGRAMME</TypeTag>
                      <Typography sx={{ fontWeight: 600, fontSize: 14.5 }}>
                        {parent.programmeName}
                        <Typography component="span" variant="caption" color="text.disabled" sx={{ ml: 1 }}>
                          {allChildrenCount === 1 ? '1 project' : `${allChildrenCount} projects`}
                        </Typography>
                      </Typography>
                      <MetaCluster record={parent} onView={goToDetail} />
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    {children.length === 0 ? (
                      <Typography variant="body2" color="text.disabled" sx={{ py: 1 }}>
                        No projects under this programme yet.
                      </Typography>
                    ) : (
                      <Stack spacing={0}>
                        {children.map((child, index) => (
                          <Box
                            key={child.id}
                            onClick={() => goToDetail(child.id)}
                            sx={{
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                              pl: 4,
                              py: 1.25,
                              ml: 1,
                              cursor: 'pointer',
                              '&:hover': { bgcolor: 'action.hover' },
                              '&::before': {
                                content: '""',
                                position: 'absolute',
                                left: 5,
                                top: 0,
                                width: '1.5px',
                                height: index === children.length - 1 ? '50%' : '100%',
                                bgcolor: 'divider',
                              },
                              '&::after': {
                                content: '""',
                                position: 'absolute',
                                left: 5,
                                top: '50%',
                                width: 12,
                                height: '1.5px',
                                bgcolor: 'divider',
                              },
                            }}
                          >
                            <TypeTag>PROJECT</TypeTag>
                            <Typography sx={{ fontWeight: 500, fontSize: 13.5, flex: 1, minWidth: 0 }}>
                              {child.programmeName}
                            </Typography>
                            <MetaCluster record={child} onView={goToDetail} />
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Card>
        )
      ) : null}
    </>
  );
}
