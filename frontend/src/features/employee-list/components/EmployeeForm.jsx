import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import FolderSharedOutlinedIcon from '@mui/icons-material/FolderSharedOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import SaveIcon from '@mui/icons-material/Save';
import { RhfAutocomplete, RhfTextField, RhfSelect } from '../../../shared/components/index.js';
import { geographyService } from '../../donor-management/services/geographyService.js';
import { applyServerErrors } from '../../../lib/forms/applyServerErrors.js';
import { useDepartments } from '../../masters/hooks/useDepartments.js';
import { useDesignations } from '../../masters/hooks/useDesignations.js';
import { EMPLOYEE_STATUSES } from '../constants.js';
import { employeeCreateSchema } from '../validation/employeeCreateSchema.js';
import { DocumentUploadCard } from './DocumentUploadCard.jsx';

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

const ACCOUNT_TYPE_OPTIONS = [
  { value: 'Savings', label: 'Savings' },
  { value: 'Current', label: 'Current' },
  { value: 'Salary', label: 'Salary' },
];

/** One numbered card section — same look as the Vendor Registration form. */
function FormSection({ number, icon: Icon, title, description, children }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, mb: 2.5 }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            <Icon sx={{ fontSize: 22 }} />
          </Box>
          <Box flex={1} sx={{ pt: 0.25 }}>
            <Stack direction="row" spacing={1} alignItems="baseline">
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: '0.06em' }}>
                {number}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
            </Stack>
            {description ? (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                {description}
              </Typography>
            ) : null}
          </Box>
        </Stack>
        <Grid container spacing={2.5}>
          {children}
        </Grid>
      </CardContent>
    </Card>
  );
}

/** Upper-cases what is typed (PAN, IFSC) as the user types. */
const upperCase = (setValue, name) => (e) => setValue(name, e.target.value.toUpperCase(), { shouldValidate: true });

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

  const departmentOptions = (departmentsQuery.data || [])
    .filter((dept) => dept.status === 'ACTIVE')
    .map((dept) => ({ value: dept.id, label: dept.name }));

  const { control, handleSubmit, setError, setValue, getValues, formState } = useForm({
    resolver: zodResolver(employeeCreateSchema),
    defaultValues,
  });

  const selectedDepartmentId = useWatch({ control, name: 'departmentId' });
  const selectedStateId = useWatch({ control, name: 'stateId' });

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

  // City options are the cities of the selected state — refetched when it changes.
  const hasState = selectedStateId !== '' && selectedStateId != null;
  const citiesQuery = useQuery({
    queryKey: ['employee-city-options', String(selectedStateId ?? '')],
    queryFn: () => geographyService.listCities(selectedStateId).catch(() => []),
    enabled: hasState,
  });
  const cityOptions = useMemo(() => (hasState ? citiesQuery.data || [] : []), [hasState, citiesQuery.data]);

  // Drop the picked city once it no longer belongs to the selected state.
  useEffect(() => {
    if (hasState && !citiesQuery.isSuccess) return; // wait for the new state's cities
    const cityId = getValues('cityId');
    if (cityId === '' || cityId == null) return;
    if (!cityOptions.some((c) => String(c.value) === String(cityId))) setValue('cityId', '');
  }, [hasState, citiesQuery.isSuccess, cityOptions, setValue, getValues]);

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

  const half = { xs: 12, sm: 6, md: 4 };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
      <FormSection
        number="01"
        icon={BadgeOutlinedIcon}
        title="Basic Details"
        description="Who the employee is and how they are employed."
      >
        <Grid size={half}>
          <RhfTextField name="empId" control={control} label="Emp ID" placeholder="e.g. EMP-13" required />
        </Grid>
        <Grid size={half}>
          <RhfTextField name="name" control={control} label="Employee Name" placeholder="e.g. Mohit Beotra" required />
        </Grid>
        <Grid size={half}>
          <RhfSelect name="employmentType" control={control} label="Employment Type" required options={EMPLOYMENT_TYPE_OPTIONS} />
        </Grid>
        <Grid size={half}>
          <RhfTextField
            name="joiningDate"
            control={control}
            label="Joining Date"
            type="date"
            required
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={half}>
          <RhfTextField
            name="exitDate"
            control={control}
            label="Exit Date"
            type="date"
            helperText="Only set once the employee has left."
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={half}>
          <RhfSelect name="status" control={control} label="Status" required options={STATUS_OPTIONS} />
        </Grid>
      </FormSection>

      <FormSection
        number="02"
        icon={WorkOutlineIcon}
        title="Role & Cost Centre"
        description="Department and state map to F4 cost centres. Bucket decides which F3 ledger the cost posts to."
      >
        <Grid size={half}>
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
        <Grid size={half}>
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
        <Grid size={half}>
          <RhfSelect name="bucket" control={control} label="Bucket" required options={BUCKET_OPTIONS} />
        </Grid>
        <Grid size={half}>
          <RhfAutocomplete
            name="stateId"
            control={control}
            label="State"
            required
            options={stateOptions}
            placeholder="Type to search"
            helperText={stateOptions.length === 0 ? 'Loading states…' : undefined}
          />
        </Grid>
        <Grid size={half}>
          <RhfAutocomplete
            name="cityId"
            control={control}
            label="City"
            options={cityOptions}
            disabled={!hasState}
            placeholder={hasState ? 'Type to search' : undefined}
            helperText={
              !hasState
                ? 'Select a state first.'
                : citiesQuery.isFetching
                  ? 'Loading cities…'
                  : cityOptions.length === 0
                    ? 'No cities found for this state.'
                    : undefined
            }
          />
        </Grid>
      </FormSection>

      <FormSection
        number="03"
        icon={PaymentsOutlinedIcon}
        title="Pay & Benefits"
        description="Yearly cost to company and the statutory benefits that apply."
      >
        <Grid size={{ xs: 12, md: 3 }}>
          <RhfTextField name="annualCtc" control={control} label="Annual CTC (Rs)" placeholder="e.g. 1500000" required />
        </Grid>
        <Grid size={{ xs: 12, sm: 4, md: 3 }}>
          <RhfSelect name="pf" control={control} label="PF" required options={YES_NO_OPTIONS} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4, md: 3 }}>
          <RhfSelect name="esi" control={control} label="ESI" required options={YES_NO_OPTIONS} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4, md: 3 }}>
          <RhfSelect name="gratuity" control={control} label="Gratuity" required options={YES_NO_OPTIONS} />
        </Grid>
      </FormSection>

      <FormSection
        number="04"
        icon={AccountBalanceOutlinedIcon}
        title="Banking Detail"
        description="The account the salary is paid into."
      >
        <Grid size={half}>
          <RhfTextField
            name="accountHolderName"
            control={control}
            label="Account Holder Name"
            placeholder="As printed on the passbook"
          />
        </Grid>
        <Grid size={half}>
          <RhfTextField name="bankName" control={control} label="Bank Name" placeholder="e.g. HDFC Bank" />
        </Grid>
        <Grid size={half}>
          <RhfSelect name="accountType" control={control} label="Account Type" options={ACCOUNT_TYPE_OPTIONS} />
        </Grid>
        <Grid size={half}>
          <RhfTextField
            name="accountNumber"
            control={control}
            label="Account Number"
            placeholder="9 to 18 digits"
            slotProps={{ htmlInput: { inputMode: 'numeric' } }}
          />
        </Grid>
        <Grid size={half}>
          <RhfTextField
            name="ifscCode"
            control={control}
            label="IFSC Code"
            placeholder="e.g. HDFC0000123"
            onChange={upperCase(setValue, 'ifscCode')}
            slotProps={{ htmlInput: { maxLength: 11 } }}
          />
        </Grid>
        <Grid size={half}>
          <RhfTextField name="branchName" control={control} label="Branch Name" placeholder="e.g. Connaught Place" />
        </Grid>
      </FormSection>

      <FormSection
        number="05"
        icon={FolderSharedOutlinedIcon}
        title="PAN & Documents"
        description="PAN number and copies of the PAN Card and Aadhaar Card."
      >
        <Grid size={half}>
          <RhfTextField
            name="panNumber"
            control={control}
            label="PAN Number"
            placeholder="e.g. ABCDE1234F"
            onChange={upperCase(setValue, 'panNumber')}
            slotProps={{ htmlInput: { maxLength: 10 } }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }} sx={{ display: { xs: 'none', md: 'block' } }} />
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="panCardFile"
            control={control}
            render={({ field }) => (
              <DocumentUploadCard title="PAN Card" value={field.value} onChange={field.onChange} />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Controller
            name="aadhaarCardFile"
            control={control}
            render={({ field }) => (
              <DocumentUploadCard title="Aadhaar Card" value={field.value} onChange={field.onChange} />
            )}
          />
        </Grid>
      </FormSection>

      <FormSection number="06" icon={NotesOutlinedIcon} title="Remark" description="Anything else worth noting.">
        <Grid size={12}>
          <RhfTextField
            name="remark"
            control={control}
            label="Remark"
            placeholder="Any additional notes about this employee…"
            multiline
            minRows={2}
          />
        </Grid>
      </FormSection>

      {submitError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      ) : null}

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
    </form>
  );
}
