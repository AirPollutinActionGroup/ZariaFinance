import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PageHeader } from '../../../shared/components/index.js';
import { useCreateEmployee } from '../hooks/useEmployees.js';
import { EmployeeForm } from '../components/EmployeeForm.jsx';
import { employeeCreateDefaults } from '../validation/employeeCreateSchema.js';

export function EmployeeCreatePage() {
  const navigate = useNavigate();
  const createEmployee = useCreateEmployee();

  const onSubmit = async (values) => {
    const created = await createEmployee.mutateAsync(values);
    navigate(`/employee-list/${created.id}`);
  };

  return (
    <Box>
      <PageHeader
        title="Add New Employee"
        subtitle="Fill in the details below to add an employee to the Employee Master register."
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/employee-list')}
          >
            Back to List
          </Button>
        }
      />

      <EmployeeForm
        defaultValues={employeeCreateDefaults}
        onSubmit={onSubmit}
        submitLabel="Save Employee"
        submitPendingLabel="Saving…"
        onCancel={() => navigate('/employee-list')}
      />
    </Box>
  );
}
