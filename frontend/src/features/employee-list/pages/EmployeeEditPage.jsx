import { Box, Button } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ErrorState, LoadingState, PageHeader } from '../../../shared/components/index.js';
import { useEmployee, useUpdateEmployee } from '../hooks/useEmployees.js';
import { EmployeeForm } from '../components/EmployeeForm.jsx';
import { toEditFormValues } from '../mappers/employeeMapper.js';

export function EmployeeEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const employeeQuery = useEmployee(id);
  const updateEmployee = useUpdateEmployee(id);

  if (employeeQuery.isPending) return <LoadingState label="Loading employee…" />;
  if (employeeQuery.isError) {
    return <ErrorState error={employeeQuery.error} onRetry={employeeQuery.refetch} />;
  }

  const onSubmit = async (values) => {
    await updateEmployee.mutateAsync(values);
    navigate(`/employee-list/${id}`);
  };

  return (
    <Box>
      <PageHeader
        title={`Edit ${employeeQuery.data.name}`}
        subtitle="Update the details below and save to apply the changes."
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(`/employee-list/${id}`)}
          >
            Back to Employee
          </Button>
        }
      />

      {/* Keyed on id so the form remounts (and re-reads defaultValues) if navigated between two employees' edit pages. */}
      <EmployeeForm
        key={id}
        defaultValues={toEditFormValues(employeeQuery.data)}
        onSubmit={onSubmit}
        submitLabel="Save Changes"
        submitPendingLabel="Saving…"
        onCancel={() => navigate(`/employee-list/${id}`)}
      />
    </Box>
  );
}
