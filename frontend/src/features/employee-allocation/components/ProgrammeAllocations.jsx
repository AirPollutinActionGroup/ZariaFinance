import { useMemo, useState } from 'react';
import { Box, Button, Card, Chip, Stack, Typography, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { useEmployeeAllocations } from '../hooks/useEmployeeAllocations.js';
import { isActiveAllocation } from '../services/employeeAllocationService.js';
import { buildProgrammeColorMap } from '../utils/colors.js';
import { allocationStatus } from '../utils/allocationStatus.js';
import { AllocationTable } from './AllocationTable.jsx';

/** Small "value / label" pair for the section header. */
function Figure({ value, label, color }) {
  return (
    <Box>
      <Typography sx={{ fontWeight: 700, fontSize: 18, lineHeight: 1.2, color }}>{value}</Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}

/**
 * Employees allocated to one programme or project — shown on /programmes/:id.
 * A programme lists allocations to itself and to all of its projects; a
 * project lists only its own.
 */
export function ProgrammeAllocations({ programme }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const [showEnded, setShowEnded] = useState(false);
  const allocationsQuery = useEmployeeAllocations();

  const isProject = programme.type === 'Project';
  const id = String(programme.id);

  const all = useMemo(
    () =>
      (allocationsQuery.data || []).filter((a) =>
        isProject ? String(a.projectId) === id : String(a.programmeId) === id,
      ),
    [allocationsQuery.data, isProject, id],
  );
  const current = all.filter(isActiveAllocation);
  const rows = showEnded ? all : current;

  // Colour by project inside a programme so each project reads apart; one colour on a project page.
  const colorMap = useMemo(
    () => buildProgrammeColorMap(all.map((a) => a.projectId ?? 'self'), theme.palette.mode),
    [all, theme.palette.mode],
  );
  const colorOf = (a) => colorMap.get(a.projectId ?? 'self');

  const people = new Set(current.map((a) => a.employeeId)).size;
  const fte = current.reduce((s, a) => s + a.allocationPct, 0) / 100;
  const endingSoon = current.filter((a) => allocationStatus(a) === 'ENDING_SOON').length;
  const ended = all.length - current.length;

  const addParams = new URLSearchParams(
    isProject
      ? { programmeId: programme.parentProgrammeId, projectId: programme.id }
      : { programmeId: programme.id },
  );

  return (
    <Box>
      <Card sx={{ mb: 1.5 }}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          sx={{ px: 2.5, py: 1.5, gap: { xs: 1.5, lg: 4 }, alignItems: { lg: 'center' } }}
        >
          <Box sx={{ minWidth: 170 }}>
            <Typography variant="overline" component="h2" sx={{ display: 'block', color: 'text.secondary', lineHeight: 1.4 }}>
              Employee allocation
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isProject ? 'Staff time given to this project' : 'Staff time on this programme and its projects'}
            </Typography>
          </Box>
          <Stack direction="row" sx={{ columnGap: 4, rowGap: 1, flexWrap: 'wrap' }}>
            <Figure value={people} label={people === 1 ? 'Employee' : 'Employees'} />
            <Figure value={Number.isInteger(fte) ? fte : fte.toFixed(2)} label="Full-time equivalent" />
            <Figure
              value={endingSoon}
              label="Ending in 30 days"
              color={endingSoon ? 'warning.main' : undefined}
            />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: { lg: 'auto' } }}>
            {ended ? (
              <Chip
                size="small"
                label={showEnded ? `Hide ended · ${ended}` : `Show ended · ${ended}`}
                variant={showEnded ? 'filled' : 'outlined'}
                color={showEnded ? 'primary' : 'default'}
                onClick={() => setShowEnded((v) => !v)}
                aria-pressed={showEnded}
              />
            ) : null}
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              sx={{ whiteSpace: 'nowrap' }}
              onClick={() => navigate(`/employee-allocation/new?${addParams}`)}
            >
              Allocate employee
            </Button>
          </Stack>
        </Stack>
      </Card>

      <AllocationTable
        rows={rows}
        colorOf={colorOf}
        isLoading={allocationsQuery.isPending}
        error={allocationsQuery.isError ? allocationsQuery.error : null}
        onRetry={allocationsQuery.refetch}
        emptyTitle={all.length ? 'No running allocations' : 'No one allocated yet'}
        emptyDescription={
          all.length
            ? 'All allocations here have ended. Use “Show ended” to see them.'
            : `Use “Allocate employee” to give part of someone's time to this ${isProject ? 'project' : 'programme'}.`
        }
      />
    </Box>
  );
}
