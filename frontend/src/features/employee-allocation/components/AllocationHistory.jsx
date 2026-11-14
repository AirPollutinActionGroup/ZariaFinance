import { Box, Stack, Typography } from '@mui/material';
import { ErrorState, LoadingState, StatusChip } from '../../../shared/components/index.js';
import { useEmployeeAllocationHistory } from '../hooks/useEmployeeAllocations.js';
import { formatDate, formatDateRange } from '../utils/formatDate.js';

const EVENT = {
  CREATED: { label: 'Added', tone: 'success' },
  ENDED: { label: 'Ended', tone: 'warning' },
  REMOVED: { label: 'Removed', tone: 'error' },
};

function when(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** What the event did, in one line. */
function summary(entry) {
  if (entry.event === 'ENDED') return `Ends ${formatDate(entry.endDate) || '—'}`;
  return formatDateRange(entry.startDate, entry.endDate) === '—'
    ? 'No dates set'
    : formatDateRange(entry.startDate, entry.endDate);
}

/**
 * An employee's allocation history as a timeline: every allocation added,
 * ended or removed, newest first. `limit` shows only the latest few.
 */
export function AllocationHistory({ employeeId, limit, emptyText = 'No allocation changes recorded yet.' }) {
  const historyQuery = useEmployeeAllocationHistory(employeeId);

  if (historyQuery.isPending) return <LoadingState label="Loading history…" />;
  if (historyQuery.isError) return <ErrorState error={historyQuery.error} onRetry={historyQuery.refetch} />;

  const entries = limit ? historyQuery.data.slice(0, limit) : historyQuery.data;
  if (!entries.length) {
    return (
      <Typography variant="body2" color="text.secondary">
        {emptyText}
      </Typography>
    );
  }

  return (
    <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {entries.map((entry, index) => {
        const event = EVENT[entry.event] || { label: entry.event, tone: 'neutral' };
        const last = index === entries.length - 1;
        return (
          <Box
            component="li"
            key={entry.id}
            sx={{
              position: 'relative',
              pl: 3,
              pb: last ? 0 : 2,
              // Timeline rail + dot.
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 6,
                top: 8,
                bottom: last ? 'auto' : -2,
                height: last ? 0 : 'auto',
                borderLeft: '1.5px solid',
                borderColor: 'divider',
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                left: 2,
                top: 5,
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: `var(--${event.tone === 'success' ? 'ok' : event.tone === 'warning' ? 'warn' : event.tone === 'error' ? 'err' : 'muted'})`,
              },
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
              <StatusChip label={event.label} tone={event.tone} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {entry.projectName ? `${entry.programmeName} › ${entry.projectName}` : entry.programmeName}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {entry.allocationPct}%
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.25 }}>
              {summary(entry)}
              {entry.role ? ` · ${entry.role}` : ''}
              {entry.stateNames ? ` · ${entry.stateNames}` : ''}
            </Typography>
            {entry.note ? (
              <Typography variant="caption" component="p" sx={{ fontStyle: 'italic' }}>
                “{entry.note}”
              </Typography>
            ) : null}
            <Typography variant="caption" color="text.disabled" component="p">
              {when(entry.changedAt)}
              {entry.changedBy ? ` · ${entry.changedBy}` : ''}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
