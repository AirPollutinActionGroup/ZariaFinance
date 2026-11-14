import { Box, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../../shared/components/index.js';
import { useCreateEmployeeAllocation, useEmployeeAllocations } from '../hooks/useEmployeeAllocations.js';
import { AllocationForm } from '../components/AllocationForm.jsx';
import { isActiveAllocation } from '../services/employeeAllocationService.js';

/** /employee-allocation/new — give part of an employee's time to a program or project. */
export function EmployeeAllocationCreatePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const allocationsQuery = useEmployeeAllocations();
  const createAllocation = useCreateEmployeeAllocation();

  // Ended allocations no longer use up the employee's time.
  const allocations = (allocationsQuery.data || []).filter(isActiveAllocation);
  const rowsFor = (employeeId) => allocations.filter((a) => String(a.employeeId) === String(employeeId));
  const totalFor = (employeeId) => rowsFor(employeeId).reduce((sum, a) => sum + a.allocationPct, 0);

  // Opened from a programme/project page: start with it picked.
  const programmeId = Number(params.get('programmeId')) || '';
  const projectId = Number(params.get('projectId')) || '';
  const initialValues = programmeId
    ? { programmeId, projectId, allocationType: projectId ? 'Project' : 'Program' }
    : undefined;
  // …and go back there when done.
  const backTo = programmeId ? `/programmes/${projectId || programmeId}` : '/employee-allocation';

  const handleAdd = async (values) => {
    await createAllocation.mutateAsync(values);
    navigate(backTo);
  };

  return (
    <Box>
      <PageHeader
        title="New Allocation"
        subtitle="Give part of an employee's time to a program or project"
        actions={
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(backTo)}>
            {programmeId ? 'Back' : 'Back to allocations'}
          </Button>
        }
      />
      <AllocationForm
        initialValues={initialValues}
        onAdd={handleAdd}
        onCancel={() => navigate(backTo)}
        headroomFor={(id) => 100 - totalFor(id)}
        existingFor={rowsFor}
        submitting={createAllocation.isPending}
      />
    </Box>
  );
}
