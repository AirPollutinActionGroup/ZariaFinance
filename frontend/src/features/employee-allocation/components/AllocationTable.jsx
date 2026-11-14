import { useState } from 'react';
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import { DataTable, StatusChip } from '../../../shared/components/index.js';
import { formatDate } from '../utils/formatDate.js';
import { allocationStatus, daysUntil, STATUS_META } from '../utils/allocationStatus.js';
import { AllocationActionDialog } from './AllocationActionDialog.jsx';

/** % with a thin bar coloured by program. */
function PctBar({ pct, color }) {
  return (
    <Stack spacing={0.5} alignItems="flex-end" sx={{ minWidth: 70 }}>
      <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
        {pct}%
      </Typography>
      <Box sx={{ width: 64, height: 5, borderRadius: 999, bgcolor: 'action.hover', overflow: 'hidden' }}>
        <Box sx={{ width: `${Math.min(pct, 100)}%`, height: '100%', bgcolor: color || 'text.secondary' }} />
      </Box>
    </Stack>
  );
}

function periodNote(row) {
  const status = allocationStatus(row);
  if (status === 'ENDED') return `Ended ${formatDate(row.endDate)}`;
  if (status === 'UPCOMING') {
    const d = daysUntil(row.startDate);
    return `Starts in ${d} ${d === 1 ? 'day' : 'days'}`;
  }
  const d = daysUntil(row.endDate);
  if (d == null) return 'Open-ended';
  if (d === 0) return 'Ends today';
  return `Ends in ${d} ${d === 1 ? 'day' : 'days'}`;
}

/** Every allocation as one row — employee, assignment, place, share, period, status, actions. */
export function AllocationTable({ rows, colorMap, colorOf, isLoading, error, onRetry, emptyTitle, emptyDescription }) {
  const [acting, setActing] = useState(null);
  const colour = colorOf || ((r) => colorMap?.get(r.programmeId));

  const columns = [
    {
      key: 'employeeName',
      header: 'Employee',
      sortValue: (r) => r.employeeName,
      render: (r) => (
        <Box sx={{ minWidth: 130 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.35 }}>
            {r.employeeName}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
            {r.empCode}
          </Typography>
        </Box>
      ),
    },
    {
      key: 'programmeName',
      header: 'Assignment',
      sortValue: (r) => r.programmeName,
      render: (r) => (
        <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ minWidth: 180 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: 0.5, mt: 0.75, flexShrink: 0, bgcolor: colour(r) }} />
          <Box>
            <Typography variant="body2" sx={{ lineHeight: 1.35 }}>
              {r.programmeName}
              {r.projectName ? (
                <Box component="span" sx={{ color: 'text.secondary' }}>
                  {' › '}
                  {r.projectName}
                </Box>
              ) : null}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {r.role || 'No role set'}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      key: 'location',
      header: 'Deployed to',
      render: (r) => (
        <Box>
          <Typography variant="body2" sx={{ lineHeight: 1.35 }}>
            {(r.stateNames || []).join(', ') || '—'}
          </Typography>
          {r.cityNames?.length ? (
            <Typography variant="caption" color="text.secondary">
              {r.cityNames.join(', ')}
            </Typography>
          ) : null}
        </Box>
      ),
    },
    {
      key: 'allocationPct',
      header: 'Share',
      align: 'right',
      sortValue: (r) => r.allocationPct,
      render: (r) => <PctBar pct={r.allocationPct} color={colour(r)} />,
    },
    {
      key: 'period',
      header: 'Period · Status',
      sx: { whiteSpace: 'nowrap' },
      sortValue: (r) => r.endDate || '9999',
      render: (r) => {
        const status = allocationStatus(r);
        const meta = STATUS_META[status];
        return (
          <>
            <Typography variant="body2" sx={{ lineHeight: 1.35 }}>
              {r.startDate ? formatDate(r.startDate) : 'No start date'}
              {r.endDate ? ` – ${formatDate(r.endDate)}` : ''}
            </Typography>
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.25 }}>
              <StatusChip label={meta.label} tone={meta.tone} />
              <Typography variant="caption" color={status === 'ENDING_SOON' ? 'warning.main' : 'text.secondary'}>
                {periodNote(r)}
              </Typography>
            </Stack>
          </>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (r) => (
        <Tooltip title={r.active === false ? 'Remove' : 'End or remove'}>
          <IconButton
            size="small"
            aria-label={`End or remove ${r.employeeName}'s allocation`}
            onClick={(e) => {
              e.stopPropagation();
              setActing(r);
            }}
          >
            <EventBusyOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <DataTable
        dense
        columns={columns}
        rows={rows}
        getRowKey={(r) => r.id}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
      />
      {acting ? <AllocationActionDialog allocation={acting} onClose={() => setActing(null)} /> : null}
    </>
  );
}
