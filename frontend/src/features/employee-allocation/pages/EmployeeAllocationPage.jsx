import { useMemo, useState } from 'react';
import { Box, Button, Chip, Stack, ToggleButton, ToggleButtonGroup, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import TableRowsOutlinedIcon from '@mui/icons-material/TableRowsOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import { EmptyState, ErrorState, LoadingState, PageHeader, SearchField, StatStrip } from '../../../shared/components/index.js';
import { useEmployeeAllocations } from '../hooks/useEmployeeAllocations.js';
import { isActiveAllocation } from '../services/employeeAllocationService.js';
import { buildProgrammeColorMap } from '../utils/colors.js';
import { allocationStatus } from '../utils/allocationStatus.js';
import { AllocationTable } from '../components/AllocationTable.jsx';
import { EmployeeAllocationCard } from '../components/EmployeeAllocationCard.jsx';

/** Status filter chips; `match` decides which allocations each one shows. */
const STATUS_FILTERS = [
  { key: 'current', label: 'Current', match: (a) => isActiveAllocation(a) },
  { key: 'ending', label: 'Ending soon', match: (a) => allocationStatus(a) === 'ENDING_SOON' },
  { key: 'ended', label: 'Ended', match: (a) => !isActiveAllocation(a) },
  { key: 'all', label: 'All', match: () => true },
];

/** Employee Allocation Manager — /employee-allocation. */
export function EmployeeAllocationPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [view, setView] = useState('table');
  const [statusFilter, setStatusFilter] = useState('current');
  const [search, setSearch] = useState('');

  const allocationsQuery = useEmployeeAllocations();
  const allocations = useMemo(() => allocationsQuery.data || [], [allocationsQuery.data]);
  const current = allocations.filter(isActiveAllocation);

  // One colour per program, the same in the table and the employee cards.
  const colorMap = useMemo(
    () => buildProgrammeColorMap(allocations.map((a) => a.programmeId), theme.palette.mode),
    [allocations, theme.palette.mode],
  );

  // Search narrows everything; the chips then pick by status (counts shown within the search).
  const searched = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return allocations;
    return allocations.filter((a) =>
      [a.employeeName, a.empCode, a.programmeName, a.projectName, a.role, ...(a.stateNames || []), ...(a.cityNames || [])]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(term)),
    );
  }, [allocations, search]);
  const filter = STATUS_FILTERS.find((f) => f.key === statusFilter) || STATUS_FILTERS[0];
  const rows = searched.filter(filter.match);

  // Headline numbers — running allocations only.
  const totalsByEmployee = new Map();
  for (const a of current) totalsByEmployee.set(a.employeeId, (totalsByEmployee.get(a.employeeId) || 0) + a.allocationPct);
  const totals = Array.from(totalsByEmployee.values());
  const fullyAllocated = totals.filter((t) => t >= 100).length;
  const avg = totals.length ? Math.round(totals.reduce((s, t) => s + t, 0) / totals.length) : 0;
  const endingSoon = allocations.filter((a) => allocationStatus(a) === 'ENDING_SOON').length;
  const stats = [
    { label: 'Employees allocated', value: totalsByEmployee.size },
    { label: 'Running allocations', value: current.length, note: `${new Set(current.map((a) => a.programmeId)).size} programs` },
    { label: 'Avg. time allocated', value: `${avg}%`, note: `${fullyAllocated} fully allocated` },
    { label: 'Ending in 30 days', value: endingSoon, color: endingSoon ? 'warning.main' : undefined },
  ];

  // By-employee groups follow the same search + status filter.
  const groups = useMemo(() => {
    const byEmployee = new Map();
    for (const a of rows) {
      if (!byEmployee.has(a.employeeId)) {
        byEmployee.set(a.employeeId, { employeeName: a.employeeName, empCode: a.empCode, rows: [] });
      }
      byEmployee.get(a.employeeId).rows.push(a);
    }
    return Array.from(byEmployee.entries());
  }, [rows]);

  const addButton = (
    <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/employee-allocation/new')}>
      Add allocation
    </Button>
  );

  return (
    <Box>
      <PageHeader
        title="Employee Allocation"
        subtitle="How each employee's time is split across programs and projects"
        actions={addButton}
      />

      {allocations.length ? <StatStrip stats={stats} sx={{ mb: 2 }} /> : null}

      <Stack direction="row" sx={{ mb: 1.5, gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ width: { xs: '100%', sm: 280 }, mr: { sm: 1 } }}>
          <SearchField value={search} onChange={setSearch} placeholder="Search employee, program, place…" />
        </Box>
        {STATUS_FILTERS.map((f) => {
          const selected = statusFilter === f.key;
          return (
            <Chip
              key={f.key}
              size="small"
              label={`${f.label} · ${searched.filter(f.match).length}`}
              onClick={() => setStatusFilter(f.key)}
              color={selected ? 'primary' : 'default'}
              variant={selected ? 'filled' : 'outlined'}
              aria-pressed={selected}
            />
          );
        })}
        <ToggleButtonGroup
          size="small"
          exclusive
          value={view}
          onChange={(_e, next) => next && setView(next)}
          sx={{ ml: 'auto', '& .MuiToggleButton-root': { px: 1.5, py: 0.5, textTransform: 'none', gap: 0.75 } }}
        >
          <ToggleButton value="table" aria-label="Table view">
            <TableRowsOutlinedIcon fontSize="small" /> Table
          </ToggleButton>
          <ToggleButton value="employee" aria-label="By employee">
            <PeopleOutlineIcon fontSize="small" /> By employee
          </ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {view === 'table' ? (
        <AllocationTable
          rows={rows}
          colorMap={colorMap}
          isLoading={allocationsQuery.isPending}
          error={allocationsQuery.isError ? allocationsQuery.error : null}
          onRetry={allocationsQuery.refetch}
          emptyTitle={allocations.length ? 'No allocations match' : 'No allocations yet'}
          emptyDescription={
            allocations.length ? 'Try another status or clear the search.' : 'Add the first allocation to see it here.'
          }
        />
      ) : allocationsQuery.isPending ? (
        <LoadingState label="Loading allocations…" />
      ) : allocationsQuery.isError ? (
        <ErrorState error={allocationsQuery.error} onRetry={allocationsQuery.refetch} />
      ) : groups.length === 0 ? (
        <EmptyState
          title={allocations.length ? 'No allocations match' : 'No allocations yet'}
          description={allocations.length ? 'Try another status or clear the search.' : 'Add the first allocation to see it here.'}
          action={allocations.length ? undefined : addButton}
        />
      ) : (
        <>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {groups.length} {groups.length === 1 ? 'employee' : 'employees'}
          </Typography>
          {groups.map(([employeeId, group]) => (
            <EmployeeAllocationCard
              key={employeeId}
              employeeId={employeeId}
              employeeName={group.employeeName}
              empCode={group.empCode}
              rows={group.rows}
              colorMap={colorMap}
            />
          ))}
        </>
      )}
    </Box>
  );
}
