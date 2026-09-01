import { useEffect, useMemo, useRef, useState } from 'react';
import { Avatar, Box, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import BadgeIcon from '@mui/icons-material/Badge';
import SaveIcon from '@mui/icons-material/Save';
import { RhfTextField, RhfSelect, RhfMultiSelect } from '../../../shared/components/index.js';
import { geographyService } from '../../donor-management/services/geographyService.js';
import { applyServerErrors } from '../../../lib/forms/applyServerErrors.js';
import { useDepartments } from '../../masters/hooks/useDepartments.js';
import { useDesignations } from '../../masters/hooks/useDesignations.js';
import { useProgrammes } from '../../donor-management/hooks/useProgrammes.js';
import { EMPLOYEE_STATUSES } from '../constants.js';
import { employeeCreateSchema } from '../validation/employeeCreateSchema.js';

const BUCKET_OPTIONS = [
  { value: 'Admin', label: 'Admin' },
  { value: 'Project', label: 'Project' },
];

const EMPLOYMENT_TYPE_OPTIONS = [
  { value: 'Permanent', label: 'Permanent' },
  { value: 'Contract', label: 'Contract' },
];

const YES_NO_OPTIONS = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
];

const STATUS_OPTIONS = EMPLOYEE_STATUSES.map((status) => ({ value: status, label: status }));

/**
 * The Employee create/edit form. Shared by EmployeeCreatePage and
 * EmployeeEditPage — `defaultValues` is read once at mount (React Hook
 * Form's normal behaviour), so a caller pre-filling it for edit must only
 * mount this component after the record has loaded (e.g. key it on the id).
 */
export function EmployeeForm({ defaultValues, onSubmit, submitLabel, submitPendingLabel, onCancel }) {
  const [stateOptions, setStateOptions] = useState([]);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    geographyService
      .listStates(1)
      .then((data) => setStateOptions(data || []))
      .catch((err) => console.error('Error fetching states:', err));
  }, []);

  const departmentsQuery = useDepartments();
  const designationsQuery = useDesignations();
  const programmesQuery = useProgrammes();

  const departmentOptions = (departmentsQuery.data || [])
    .filter((dept) => dept.status === 'ACTIVE')
    .map((dept) => ({ value: dept.id, label: dept.name }));

  const programmeOptions = (programmesQuery.data || [])
    .filter((programme) => programme.isActive)
    .map((programme) => ({ value: programme.id, label: programme.programmeName }));

  const { control, handleSubmit, setError, setValue, getValues, formState } = useForm({
    resolver: zodResolver(employeeCreateSchema),
    defaultValues,
  });

  const selectedBucket = useWatch({ control, name: 'bucket' });
  const selectedDepartmentId = useWatch({ control, name: 'departmentId' });
  const selectedStateIds = useWatch({ control, name: 'stateIds' }) || [];

  const designationOptions = (designationsQuery.data || [])
    .filter((desig) => desig.status === 'ACTIVE' && desig.departmentId === selectedDepartmentId)
    .map((desig) => ({ value: desig.id, label: desig.name }));

  // Designation options depend on the selected department — drop a stale
  // pick when the department changes to a set that no longer contains it.
  // Compared against the last department id this effect actually reacted
  // to (starting from the form's initial value, which may be pre-filled
  // for edit) rather than "skip the first run": a ref that just skips one
  // invocation breaks under React StrictMode's double-effect-on-mount in
  // dev, since the guard is already consumed by the first simulated mount.
  const settledDepartmentId = useRef(defaultValues.departmentId);
  useEffect(() => {
    if (selectedDepartmentId === settledDepartmentId.current) return;
    settledDepartmentId.current = selectedDepartmentId;
    setValue('designationId', '');
  }, [selectedDepartmentId, setValue]);

  // Primary programme only applies to the Project bucket — same
  // settled-value comparison as above, for the same StrictMode reason.
  const settledBucket = useRef(defaultValues.bucket);
  useEffect(() => {
    if (selectedBucket === settledBucket.current) return;
    settledBucket.current = selectedBucket;
    if (selectedBucket !== 'Project') {
      setValue('primaryProgrammeIds', []);
    }
  }, [selectedBucket, setValue]);

  // City options are the union of cities across every selected state — refetch
  // whenever the state selection changes.
  const selectedStateIdsKey = selectedStateIds.join(',');
  const citiesQuery = useQuery({
    queryKey: ['employee-city-options', selectedStateIdsKey],
    queryFn: async () => {
      const results = await Promise.all(
        selectedStateIds.map((stateId) => geographyService.listCities(stateId).catch(() => [])),
      );
      const merged = results.flat();
      return Array.from(new Map(merged.map((c) => [c.value, c])).values());
    },
    enabled: selectedStateIds.length > 0,
  });
  const cityOptions = useMemo(() => citiesQuery.data || [], [citiesQuery.data]);

  // Drop any previously-picked city that's no longer valid for the current states.
  useEffect(() => {
    const validIds = new Set(cityOptions.map((c) => c.value));
    const currentCityIds = getValues('cityIds') || [];
    const filtered = currentCityIds.filter((id) => validIds.has(id));
    if (filtered.length !== currentCityIds.length) {
      setValue('cityIds', filtered);
    }
  }, [cityOptions, setValue, getValues]);

  const handleFormSubmit = async (values) => {
    setSubmitError(null);
    try {
      await onSubmit(values);
    } catch (error) {
      const appliedToField = applyServerErrors(error, setError);
      if (!appliedToField) {
        setSubmitError(error?.message || 'Something went wrong. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
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
                name="departmentId"
                control={control}
                label="Department (F4)"
                required
                disabled={departmentsQuery.isLoading}
                options={departmentOptions}
                helperText={
                  departmentsQuery.isLoading
                    ? 'Loading departments…'
                    : departmentOptions.length === 0
                      ? 'No active departments configured.'
                      : undefined
                }
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <RhfSelect
                name="designationId"
                control={control}
                label="Designation"
                required
                disabled={designationsQuery.isLoading || !selectedDepartmentId}
                options={designationOptions}
                helperText={
                  designationsQuery.isLoading
                    ? 'Loading designations…'
                    : !selectedDepartmentId
                      ? 'Select a department first.'
                      : designationOptions.length === 0
                        ? 'No active designations for this department.'
                        : undefined
                }
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
                <RhfMultiSelect
                  name="primaryProgrammeIds"
                  control={control}
                  label="Primary Programme"
                  required
                  options={programmeOptions}
                  helperText={
                    programmesQuery.isLoading
                      ? 'Loading programmes…'
                      : programmeOptions.length === 0
                        ? 'No active programmes configured.'
                        : undefined
                  }
                />
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <RhfMultiSelect
                name="stateIds"
                control={control}
                label="State"
                required
                options={stateOptions}
                helperText={stateOptions.length === 0 ? 'Loading states…' : undefined}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <RhfMultiSelect
                name="cityIds"
                control={control}
                label="City"
                options={cityOptions}
                helperText={
                  selectedStateIds.length === 0
                    ? 'Select a state first.'
                    : citiesQuery.isFetching
                      ? 'Loading cities…'
                      : cityOptions.length === 0
                        ? 'No cities found for the selected state(s).'
                        : undefined
                }
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
              <RhfTextField
                name="joiningDate"
                control={control}
                label="Joining Date"
                type="date"
                required
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <RhfTextField
                name="exitDate"
                control={control}
                label="Exit Date"
                type="date"
                helperText="Only set once the employee has left."
                slotProps={{ inputLabel: { shrink: true } }}
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
        <Button variant="outlined" size="large" onClick={onCancel} sx={{ px: 3, fontWeight: 700 }}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          size="large"
          startIcon={<SaveIcon />}
          disabled={formState.isSubmitting}
          sx={{ px: 4, fontWeight: 700, borderRadius: 2 }}
        >
          {formState.isSubmitting ? submitPendingLabel : submitLabel}
        </Button>
      </Stack>
      {submitError ? (
        <Typography color="error.main" sx={{ mt: 2, textAlign: 'right' }}>
          {submitError}
        </Typography>
      ) : null}
    </form>
  );
}
