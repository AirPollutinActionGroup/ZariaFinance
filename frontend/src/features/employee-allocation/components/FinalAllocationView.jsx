import { Grid } from '@mui/material';
import { DataTable, StatCard } from '../../../shared/components/index.js';
import { formatDateRange } from '../utils/formatDate.js';

/** Flattened cross-employee summary — the "Final view" tab. */
export function FinalAllocationView({ allocations, isLoading, error, onRetry }) {
  const employeeIds = new Set(allocations.map((a) => a.employeeId));
  const programmeIds = new Set(allocations.map((a) => a.programmeId));
  const totalPct = allocations.reduce((sum, a) => sum + a.allocationPct, 0);
  const avgPerEmployee = employeeIds.size ? Math.round(totalPct / employeeIds.size) : 0;

  const totalsByEmployee = new Map();
  for (const a of allocations) {
    totalsByEmployee.set(a.employeeId, (totalsByEmployee.get(a.employeeId) || 0) + a.allocationPct);
  }
  const overAllocated = Array.from(totalsByEmployee.values()).filter((t) => t > 100).length;

  const columns = [
    { key: 'employeeName', header: 'Employee' },
    { key: 'programmeName', header: 'Program' },
    { key: 'projectName', header: 'Project', render: (r) => r.projectName || '—' },
    {
      key: 'location',
      header: 'Location',
      render: (r) => (r.cityNames?.length ? r.cityNames.join(', ') : (r.stateNames || []).join(', ') || '—'),
    },
    { key: 'allocationPct', header: 'Alloc.', align: 'right', render: (r) => `${r.allocationPct}%` },
    { key: 'dates', header: 'Dates', render: (r) => formatDateRange(r.startDate, r.endDate) },
    { key: 'remark', header: 'Remark', render: (r) => r.remark || '—' },
  ];

  return (
    <>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Employees" value={employeeIds.size} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Programs" value={programmeIds.size} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Avg. allocation" value={`${avgPerEmployee}%`} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard label="Over-allocated" value={overAllocated} />
        </Grid>
      </Grid>

      <DataTable
        columns={columns}
        rows={allocations}
        getRowKey={(r) => r.id}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        emptyTitle="No allocations yet"
        emptyDescription="Add an allocation to see the full breakdown here."
      />
    </>
  );
}
