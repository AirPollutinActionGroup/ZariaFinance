import { useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, Chip, Link, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { ACTIONS, PermissionGate } from '../../../core/permissions/index.js';
import {
  ConfirmDialog,
  DataTable,
  ErrorState,
  LoadingState,
  PageHeader,
  StatusChip,
} from '../../../shared/components/index.js';
import { formatDate, formatDateTime } from '../../../lib/format/date.js';
import { useProgramme, useProgrammes, useUpdateProgrammeStatus } from '../hooks/useProgrammes.js';
import { MODULE_ID, PROGRAMME_STATUS_TONE } from '../constants.js';
import { ProgrammeStatusBar } from '../components/ProgrammeStatusBar.jsx';
import { ProgrammeAllocations } from '../../employee-allocation/components/ProgrammeAllocations.jsx';

/** "6 months", "1 year 2 months", "12 days" — the length of a start → end period. */
function durationLabel(startDate, endDate) {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null;
  const days = Math.round((end - start) / 86400000) + 1;
  if (days < 45) return `${days} ${days === 1 ? 'day' : 'days'}`;
  const months = Math.round(days / 30.44);
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [];
  if (years) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
  if (rest) parts.push(`${rest} ${rest === 1 ? 'month' : 'months'}`);
  return parts.join(' ');
}

/** One group of compact "label  value" rows; blank values are left out. */
function DetailGroup({ title, items }) {
  const filled = items.filter(([, value]) => value != null && value !== '' && value !== false);
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="overline" component="h3" sx={{ display: 'block', color: 'text.secondary', lineHeight: 1.6, mb: 0.75 }}>
        {title}
      </Typography>
      {filled.length ? (
        <Box
          component="dl"
          sx={{
            m: 0,
            display: 'grid',
            gridTemplateColumns: 'max-content minmax(0, 1fr)',
            columnGap: 1.5,
            rowGap: 0.75,
            fontSize: 13,
          }}
        >
          {filled.map(([label, value]) => (
            <Box key={label} sx={{ display: 'contents' }}>
              <Box component="dt" sx={{ color: 'text.secondary' }}>
                {label}
              </Box>
              <Box component="dd" sx={{ m: 0, fontWeight: 500, overflowWrap: 'break-word' }}>
                {value}
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
          Not added
        </Typography>
      )}
    </Box>
  );
}

function PlaceChips({ names }) {
  if (!names?.length) return null;
  return (
    <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
      {names.map((name) => (
        <Chip key={name} label={name} size="small" variant="outlined" sx={{ fontSize: 11.5, height: 22 }} />
      ))}
    </Stack>
  );
}

const projectColumns = [
  {
    key: 'programmeCode',
    header: 'Code',
    sx: { whiteSpace: 'nowrap' },
    render: (row) => (
      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12.5, color: 'text.secondary' }}>
        {row.programmeCode || '—'}
      </Typography>
    ),
  },
  {
    key: 'programmeName',
    header: 'Project',
    render: (row) => (
      <Box sx={{ minWidth: 180 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.35 }}>
          {row.programmeName}
        </Typography>
        {row.description ? (
          <Typography variant="caption" color="text.secondary">
            {row.description}
          </Typography>
        ) : null}
      </Box>
    ),
  },
  {
    key: 'states',
    header: 'States',
    render: (row) => (row.stateNames?.length ? <PlaceChips names={row.stateNames} /> : '—'),
  },
  {
    key: 'period',
    header: 'Period',
    sx: { whiteSpace: 'nowrap' },
    render: (row) =>
      row.startDate || row.endDate ? `${formatDate(row.startDate) || '—'} – ${formatDate(row.endDate) || '—'}` : '—',
  },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <StatusChip label={row.status} tone={PROGRAMME_STATUS_TONE[row.status] || 'neutral'} />,
  },
];

/** Single programme or project view — /programmes/:id. */
export function ProgrammeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const programmeQuery = useProgramme(id);
  const programmesQuery = useProgrammes();
  const updateStatus = useUpdateProgrammeStatus(id);
  const [pendingStatus, setPendingStatus] = useState(null);

  const projects = useMemo(
    () => (programmesQuery.data || []).filter((p) => p.type === 'Project' && String(p.parentProgrammeId) === String(id)),
    [programmesQuery.data, id],
  );

  if (programmeQuery.isPending) return <LoadingState label="Loading programme…" />;
  if (programmeQuery.isError) {
    return <ErrorState error={programmeQuery.error} onRetry={programmeQuery.refetch} />;
  }

  const programme = programmeQuery.data;
  const isProject = programme.type === 'Project';
  const kind = isProject ? 'Project' : 'Programme';
  const status = programme.status || (programme.isActive ? 'Active' : 'Inactive');
  const duration = durationLabel(programme.startDate, programme.endDate);

  const requestStatusChange = (next) => {
    if (next !== programme.status) setPendingStatus(next);
  };

  const confirmStatusChange = async () => {
    await updateStatus.mutateAsync(pendingStatus);
    setPendingStatus(null);
  };

  const parentLink = programme.parentProgrammeId ? (
    <Link component={RouterLink} to={`/programmes/${programme.parentProgrammeId}`} underline="hover">
      {programme.parentProgrammeName || `Programme #${programme.parentProgrammeId}`}
    </Link>
  ) : null;

  return (
    <>
      <PageHeader
        title={programme.programmeName}
        subtitle={
          isProject && parentLink ? (
            <>
              Project {programme.programmeCode} · under {parentLink}
            </>
          ) : (
            `${kind} ${programme.programmeCode}`
          )
        }
        actions={
          <Stack direction="row" spacing={1.5}>
            <Button color="inherit" startIcon={<ArrowBackIcon />} onClick={() => navigate('/programmes')}>
              All programmes
            </Button>
            {!isProject ? (
              <PermissionGate action={ACTIONS.EDIT} moduleId={MODULE_ID}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate(`/programmes/new?parent=${programme.id}`)}
                >
                  Add project
                </Button>
              </PermissionGate>
            ) : null}
          </Stack>
        }
      />

      <Stack spacing={2}>
        <Card>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            sx={{
              px: 2.5,
              py: 1.25,
              gap: 1,
              alignItems: { sm: 'center' },
              justifyContent: 'space-between',
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap' }}>
              <StatusChip label={kind} tone="graphite" />
              <StatusChip label={status} tone={PROGRAMME_STATUS_TONE[programme.status] || (programme.isActive ? 'success' : 'neutral')} />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Created {formatDateTime(programme.createdAt)}
              {programme.updatedAt ? ` · Updated ${formatDateTime(programme.updatedAt)}` : ''}
            </Typography>
          </Stack>

          <CardContent sx={{ px: 2.5, py: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', columnGap: 4, rowGap: 2.5 }}>
              <DetailGroup
                title="Overview"
                items={[
                  ['Code', <Box key="c" component="span" sx={{ fontFamily: 'monospace' }}>{programme.programmeCode}</Box>],
                  ['Type', kind],
                  ['Parent programme', parentLink],
                  ['Projects', isProject ? null : String(projects.length)],
                ]}
              />
              <DetailGroup
                title="Timeline"
                items={[
                  ['Start', programme.startDate ? formatDate(programme.startDate) : null],
                  ['End', programme.endDate ? formatDate(programme.endDate) : null],
                  ['Duration', duration],
                ]}
              />
              <DetailGroup
                title="Location"
                items={[
                  ['States', programme.stateNames?.length ? <PlaceChips names={programme.stateNames} /> : null],
                  ['Cities', programme.cityNames?.length ? <PlaceChips names={programme.cityNames} /> : null],
                ]}
              />
            </Box>

            <Box sx={{ mt: 2.5 }}>
              <Typography variant="overline" component="h3" sx={{ display: 'block', color: 'text.secondary', lineHeight: 1.6, mb: 0.5 }}>
                Description
              </Typography>
              <Typography variant="body2" color={programme.description ? 'text.primary' : 'text.secondary'} sx={{ fontSize: 13, whiteSpace: 'pre-line' }}>
                {programme.description || 'No description added.'}
              </Typography>
            </Box>
          </CardContent>

          <PermissionGate action={ACTIONS.EDIT} moduleId={MODULE_ID}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              sx={{
                px: 2.5,
                py: 1.5,
                gap: { xs: 1, md: 2 },
                alignItems: { md: 'center' },
                borderTop: 1,
                borderColor: 'divider',
                bgcolor: 'action.hover',
              }}
            >
              <Box sx={{ minWidth: 150 }}>
                <Typography variant="overline" component="h3" sx={{ display: 'block', color: 'text.secondary', lineHeight: 1.4 }}>
                  Lifecycle status
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Click a status to change it
                </Typography>
              </Box>
              <ProgrammeStatusBar value={programme.status} onChange={requestStatusChange} />
            </Stack>
          </PermissionGate>
        </Card>

        {!isProject ? (
          <DataTable
            dense
            title={projects.length ? `Projects · ${projects.length}` : 'Projects'}
            columns={projectColumns}
            rows={projects}
            getRowKey={(row) => row.id}
            isLoading={programmesQuery.isPending}
            error={programmesQuery.isError ? programmesQuery.error : null}
            onRetry={programmesQuery.refetch}
            emptyTitle="No projects yet"
            emptyDescription="Projects under this programme will be listed here. Use “Add project” above to create one."
            onRowClick={(row) => navigate(`/programmes/${row.id}`)}
          />
        ) : null}

        <ProgrammeAllocations programme={programme} />
      </Stack>

      <ConfirmDialog
        open={Boolean(pendingStatus)}
        title="Change status"
        description={`Change ${programme.programmeName}'s status from "${programme.status}" to "${pendingStatus}"?`}
        confirmLabel="Change status"
        confirmColor="primary"
        busy={updateStatus.isPending}
        onConfirm={confirmStatusChange}
        onClose={() => setPendingStatus(null)}
      />
    </>
  );
}
