import { useState } from 'react';
import { Box, Button, Dialog, DialogTitle, Tab, Tabs } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { EmptyState, ErrorState, LoadingState, PageHeader } from '../../../shared/components/index.js';
import {
  useEmployeeAllocations,
  useCreateEmployeeAllocation,
  useRemoveEmployeeAllocation,
} from '../hooks/useEmployeeAllocations.js';
import { AllocationForm } from '../components/AllocationForm.jsx';
import { EmployeeSplitBars } from '../components/EmployeeSplitBars.jsx';
import { EmployeeAllocationCard } from '../components/EmployeeAllocationCard.jsx';
import { FinalAllocationView } from '../components/FinalAllocationView.jsx';

export function EmployeeAllocationPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [formOpen, setFormOpen] = useState(false);

  const allocationsQuery = useEmployeeAllocations();
  const createAllocation = useCreateEmployeeAllocation();
  const removeAllocation = useRemoveEmployeeAllocation();

  const allocations = allocationsQuery.data || [];

  const totalForEmployee = (employeeId) =>
    allocations.filter((a) => a.employeeId === employeeId).reduce((sum, a) => sum + a.allocationPct, 0);

  const byEmployee = new Map();
  for (const a of allocations) {
    if (!byEmployee.has(a.employeeId)) {
      byEmployee.set(a.employeeId, { employeeName: a.employeeName, empCode: a.empCode, rows: [] });
    }
    byEmployee.get(a.employeeId).rows.push(a);
  }

  const handleAdd = async (values) => {
    await createAllocation.mutateAsync(values);
    setFormOpen(false);
  };

  return (
    <Box>
      <PageHeader
        title="Employee Allocation Manager"
        subtitle="Split each employee's time across programs and projects, with the state/city they're deployed to."
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
            Add allocation
          </Button>
        }
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: 14, minHeight: 48 } }}
        >
          <Tab label="Final view" />
          <Tab label="By employee" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <FinalAllocationView
          allocations={allocations}
          isLoading={allocationsQuery.isLoading}
          error={allocationsQuery.isError ? allocationsQuery.error : null}
          onRetry={allocationsQuery.refetch}
        />
      )}

      {activeTab === 1 && (
        <Box>
          {allocationsQuery.isLoading ? (
            <LoadingState label="Loading allocations…" />
          ) : allocationsQuery.isError ? (
            <ErrorState error={allocationsQuery.error} onRetry={allocationsQuery.refetch} />
          ) : (
            <>
              <EmployeeSplitBars allocations={allocations} />
              {allocations.length === 0 ? (
                <EmptyState
                  title="No allocations added yet"
                  description="Add the first allocation to see it here."
                  action={
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
                      Add allocation
                    </Button>
                  }
                />
              ) : (
                Array.from(byEmployee.entries()).map(([employeeId, group]) => (
                  <EmployeeAllocationCard
                    key={employeeId}
                    employeeName={group.employeeName}
                    empCode={group.empCode}
                    rows={group.rows}
                    onRemove={(id) => removeAllocation.mutate(id)}
                  />
                ))
              )}
            </>
          )}
        </Box>
      )}

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>New allocation</DialogTitle>
        <AllocationForm
          onAdd={handleAdd}
          onCancel={() => setFormOpen(false)}
          headroomFor={(id) => 100 - totalForEmployee(id)}
          submitting={createAllocation.isPending}
        />
      </Dialog>
    </Box>
  );
}
