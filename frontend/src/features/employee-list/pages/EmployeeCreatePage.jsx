import { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import BadgeIcon from '@mui/icons-material/Badge';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PageHeader, RhfTextField, RhfSelect } from '../../../shared/components/index.js';
import { geographyService } from '../../donor-management/services/geographyService.js';
import { applyServerErrors } from '../../../lib/forms/applyServerErrors.js';
import { useCreateEmployee } from '../hooks/useEmployees.js';
import {
  employeeCreateSchema,
  employeeCreateDefaults,
} from '../validation/employeeCreateSchema.js';

const DEPARTMENT_OPTIONS = [
  { value: 'DEPT-LEADERSHIP', label: 'DEPT-LEADERSHIP' },
  { value: 'DEPT-PROCESS', label: 'DEPT-PROCESS' },
  { value: 'DEPT-SPP', label: 'DEPT-SPP' },
  { value: 'DEPT-PMU-CPCB', label: 'DEPT-PMU-CPCB' },
];

const BUCKET_OPTIONS = [
  { value: 'Admin', label: 'Admin' },
  { value: 'Project', label: 'Project' },
];

const PROGRAMME_OPTIONS = [
  { value: 'PP1', label: 'PP1' },
  { value: 'PP6', label: 'PP6' },
];

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'Permanent', label: 'Permanent' },
  { value: 'Contract', label: 'Contract' },
];

const YES_NO_OPTIONS = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
];

const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

export function EmployeeCreatePage() {
  const navigate = useNavigate();
  const [states, setStates] = useState([]);

  useEffect(() => {
    geographyService
      .listStates(1)
      .then((data) => {
        if (data && data.length > 0) {
          // Map to state name labels matching Employee Master schema
          setStates(data.map((s) => ({ value: s.label, label: s.label })));
        }
      })
      .catch((err) => console.error('Error fetching states:', err));
  }, []);

  const createEmployee = useCreateEmployee();

  const { control, handleSubmit, setError } = useForm({
    resolver: zodResolver(employeeCreateSchema),
    defaultValues: employeeCreateDefaults,
  });

  const selectedBucket = useWatch({ control, name: 'bucket' });

  const onSubmit = async (values) => {
    try {
      const created = await createEmployee.mutateAsync(values);
      navigate(`/employee-list/${created.id}`);
    } catch (error) {
      applyServerErrors(error, setError);
    }
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

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Stack
              direction="row"
              spacing={2.5}
              alignItems="center"
              sx={{ mb: 4, pb: 3, borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: 'primary.main',
                  fontWeight: 700,
                  borderRadius: 3,
                }}
              >
                <BadgeIcon sx={{ fontSize: 30 }} />
              </Avatar>

              <Box flex={1}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Employee Information
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Department and state map to F4 cost centres. Bucket determines which F3 ledger the cost posts to.
                </Typography>
              </Box>
            </Stack>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <RhfTextField
                  name="empId"
                  control={control}
                  label="Emp ID"
                  placeholder="e.g. EMP-13"
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <RhfTextField
                  name="name"
                  control={control}
                  label="Employee Name"
                  placeholder="e.g. Mohit Beotra"
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <RhfSelect
                  name="department"
                  control={control}
                  label="Department (F4)"
                  required
                  options={DEPARTMENT_OPTIONS}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <RhfTextField
                  name="designation"
                  control={control}
                  label="Designation"
                  placeholder="e.g. Finance Manager"
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <RhfSelect
                  name="bucket"
                  control={control}
                  label="Bucket"
                  required
                  options={BUCKET_OPTIONS}
                />
              </Grid>

              {selectedBucket === 'Project' && (
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <RhfSelect
                    name="primaryProgramme"
                    control={control}
                    label="Primary Programme"
                    required
                    options={PROGRAMME_OPTIONS}
                  />
                </Grid>
              )}

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <RhfSelect
                  name="state"
                  control={control}
                  label="State"
                  required
                  options={states}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <RhfSelect
                  name="employmentType"
                  control={control}
                  label="Employment Type"
                  required
                  options={EMPLOYMENT_TYPE_OPTIONS}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <RhfSelect
                  name="pf"
                  control={control}
                  label="PF"
                  required
                  options={YES_NO_OPTIONS}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <RhfSelect
                  name="esi"
                  control={control}
                  label="ESI"
                  required
                  options={YES_NO_OPTIONS}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <RhfSelect
                  name="gratuity"
                  control={control}
                  label="Gratuity"
                  required
                  options={YES_NO_OPTIONS}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <RhfTextField
                  name="annualCtc"
                  control={control}
                  label="Annual CTC (Rs)"
                  placeholder="e.g. 1500000"
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <RhfSelect
                  name="status"
                  control={control}
                  label="Status"
                  required
                  options={STATUS_OPTIONS}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* BOTTOM ACTION BUTTONS */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/employee-list')}
            sx={{ px: 3, fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<SaveIcon />}
            disabled={createEmployee.isPending}
            sx={{ px: 4, fontWeight: 700, borderRadius: 2 }}
          >
            {createEmployee.isPending ? 'Saving…' : 'Save Employee'}
          </Button>
        </Stack>
        {createEmployee.isError && !createEmployee.error?.isValidationError ? (
          <Typography color="error.main" sx={{ mt: 2, textAlign: 'right' }}>
            {createEmployee.error?.message || 'Failed to add employee.'}
          </Typography>
        ) : null}
      </form>
    </Box>
  );
}
