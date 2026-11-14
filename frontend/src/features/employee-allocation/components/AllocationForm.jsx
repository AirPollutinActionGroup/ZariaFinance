import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  FormHelperText,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { RhfAutocomplete, RhfSelect, RhfMultiSelect, RhfTextField } from '../../../shared/components/index.js';
import { useEmployees } from '../../employee-list/hooks/useEmployees.js';
import { useProgramme, useProgrammes } from '../../donor-management/hooks/useProgrammes.js';
import { geographyService } from '../../donor-management/services/geographyService.js';
import { applyServerErrors } from '../../../lib/forms/applyServerErrors.js';
import { ALLOCATION_TYPE_OPTIONS, allocationSchema, allocationFormDefaults } from '../validation/allocationSchema.js';
import { AllocationHistory } from './AllocationHistory.jsx';

/** Small overline heading for each group of fields. */
function SectionLabel({ children, hint, step }) {
  return (
    <Box sx={{ mb: 1.75 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        {step ? (
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              fontSize: 12,
              fontWeight: 700,
              bgcolor: 'text.primary',
              color: 'background.paper',
              flexShrink: 0,
            }}
          >
            {step}
          </Box>
        ) : null}
        <Typography variant="subtitle2" component="h3" sx={{ fontWeight: 700 }}>
          {children}
        </Typography>
      </Stack>
      {hint ? (
        <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 0.5, ml: 3.75 }}>
          {hint}
        </Typography>
      ) : null}
    </Box>
  );
}

const TYPE_ICON = { Program: AccountTreeOutlinedIcon, Project: AssignmentOutlinedIcon };
const TYPE_HINT = { Program: 'Time on a whole program', Project: 'Time on one project under a program' };

/** Program / Project segmented switch. */
function TypeSwitch({ value, onChange, error }) {
  return (
    <Box>
      <Box role="radiogroup" aria-label="Allocation type" sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25 }}>
        {ALLOCATION_TYPE_OPTIONS.map(({ value: type, label }) => {
          const selected = value === type;
          const Icon = TYPE_ICON[type];
          return (
            <Box
              key={type}
              component="button"
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(type)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                px: 1.5,
                py: 1.1,
                textAlign: 'left',
                font: 'inherit',
                cursor: 'pointer',
                borderRadius: 2,
                border: '1.5px solid',
                borderColor: selected ? 'text.primary' : error ? 'error.main' : 'divider',
                bgcolor: selected ? 'action.selected' : 'background.paper',
                color: 'text.primary',
                '&:hover': { borderColor: selected ? 'text.primary' : 'text.secondary' },
                '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
              }}
            >
              <Icon fontSize="small" sx={{ color: selected ? 'text.primary' : 'text.secondary' }} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {TYPE_HINT[type]}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
      {error ? <FormHelperText error>{error}</FormHelperText> : null}
    </Box>
  );
}

function Legend({ color, label, value, outlined = false }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: color, border: outlined ? 1 : 0, borderColor: 'divider' }} />
      <Typography variant="caption" color="text.secondary">
        {label}{' '}
        <Box component="b" sx={{ color: 'text.primary' }}>
          {value}%
        </Box>
      </Typography>
    </Stack>
  );
}

/**
 * The selected employee's time as one stacked bar: already allocated,
 * what this allocation adds, and what is left after it.
 */
function CapacityBar({ used, adding }) {
  const add = Math.max(0, Math.min(adding, 100 - used));
  const left = Math.max(0, 100 - used - add);
  return (
    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
      <Box
        sx={{
          display: 'flex',
          height: 10,
          borderRadius: 999,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ width: `${used}%`, bgcolor: 'text.disabled' }} />
        <Box sx={{ width: `${add}%`, bgcolor: 'success.main', transition: 'width 0.2s' }} />
      </Box>
      <Stack direction="row" spacing={2} sx={{ mt: 1, flexWrap: 'wrap', rowGap: 0.5 }}>
        <Legend color="text.disabled" label="Already allocated" value={used} />
        <Legend color="success.main" label="This allocation" value={add} />
        <Legend color="background.paper" label="Left after this" value={left} outlined />
      </Stack>
    </Box>
  );
}

const KNOWN_FIELDS = [
  'employeeId',
  'allocationType',
  'programmeId',
  'projectId',
  'role',
  'stateIds',
  'cityIds',
  'allocationPct',
  'startDate',
  'endDate',
  'remark',
];

/**
 * "Program" and "Project" are both Programme records — a Project is a
 * Programme with type === 'Project' whose parentProgrammeId points at a
 * Program (see donor-management/components/ProgrammeForm.jsx for the same
 * classification). This form re-uses that hierarchy rather than inventing
 * a parallel one.
 */
export function AllocationForm({ initialValues, onAdd, headroomFor, existingFor, onCancel, submitting }) {
  const [stateOptions, setStateOptions] = useState([]);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    geographyService
      .listStates(1)
      .then((data) => setStateOptions(data || []))
      .catch((err) => console.error('Error fetching states:', err));
  }, []);

  const employeesQuery = useEmployees();
  const programmesQuery = useProgrammes();

  const employeeOptions = (employeesQuery.data || []).map((e) => ({
    value: e.id,
    label: `${e.name} (${e.empId})`,
  }));

  const programmeOptions = (programmesQuery.data || [])
    .filter((p) => p.isActive && p.type !== 'Project')
    .map((p) => ({ value: p.id, label: p.programmeName }));

  const { control, handleSubmit, reset, setError, setValue, getValues } = useForm({
    resolver: zodResolver(allocationSchema),
    defaultValues: { ...allocationFormDefaults, ...initialValues },
  });

  const selectedEmployeeId = useWatch({ control, name: 'employeeId' });
  const allocationType = useWatch({ control, name: 'allocationType' });
  const isProjectAllocation = allocationType === 'Project';
  const selectedProgrammeId = useWatch({ control, name: 'programmeId' });
  const selectedProjectId = useWatch({ control, name: 'projectId' });
  const selectedStateIds = useWatch({ control, name: 'stateIds' }) || [];
  const allocationPct = useWatch({ control, name: 'allocationPct' });

  const projectOptions = (programmesQuery.data || [])
    .filter(
      (p) => p.isActive && p.type === 'Project' && String(p.parentProgrammeId) === String(selectedProgrammeId),
    )
    .map((p) => ({ value: p.id, label: p.programmeName }));

  // Drop a previously-picked project once it no longer belongs to the
  // selected program.
  useEffect(() => {
    if (!programmesQuery.data) return; // wait for the list before judging a prefilled project
    const validIds = new Set(projectOptions.map((o) => o.value));
    const current = getValues('projectId');
    if (current && !validIds.has(current)) {
      setValue('projectId', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProgrammeId]);

  // A Program allocation has no project — clear one picked before switching type.
  useEffect(() => {
    if (!isProjectAllocation && getValues('projectId')) {
      setValue('projectId', '');
    }
  }, [isProjectAllocation, getValues, setValue]);

  // An allocation's state/city must fall within the selected project's own
  // geography, or the program's when no project is picked — the list
  // response doesn't carry state/city ids, so the full record is fetched
  // (same pattern as ProgrammeForm's parent-geography restriction).
  const geographySourceId = selectedProjectId || selectedProgrammeId;
  const geographySourceLabel = selectedProjectId ? 'project' : 'program';
  const projectQuery = useProgramme(geographySourceId || undefined);
  const projectStateIds = useMemo(
    () => (geographySourceId && projectQuery.data ? new Set((projectQuery.data.stateIds || []).map(String)) : null),
    [geographySourceId, projectQuery.data],
  );
  const projectCityIds = useMemo(
    () => (geographySourceId && projectQuery.data ? new Set((projectQuery.data.cityIds || []).map(String)) : null),
    [geographySourceId, projectQuery.data],
  );

  const effectiveStateOptions = useMemo(() => {
    if (!projectStateIds) return [];
    return stateOptions.filter((option) => projectStateIds.has(String(option.value)));
  }, [projectStateIds, stateOptions]);

  // Drop a previously-picked state that's no longer valid once the project changes.
  useEffect(() => {
    const validIds = new Set(effectiveStateOptions.map((s) => s.value));
    const current = getValues('stateIds') || [];
    const filtered = current.filter((id) => validIds.has(id));
    if (filtered.length !== current.length) {
      setValue('stateIds', filtered);
    }
  }, [effectiveStateOptions, setValue, getValues]);

  // City options are the union of cities across every selected state,
  // further narrowed to the selected project's own cities.
  const selectedStateIdsKey = selectedStateIds.join(',');
  const citiesQuery = useQuery({
    queryKey: ['employee-allocation-city-options', selectedStateIdsKey],
    queryFn: async () => {
      const results = await Promise.all(
        selectedStateIds.map((stateId) => geographyService.listCities(stateId).catch(() => [])),
      );
      const merged = results.flat();
      return Array.from(new Map(merged.map((c) => [c.value, c])).values());
    },
    enabled: selectedStateIds.length > 0,
  });
  const cityOptions = useMemo(() => {
    const all = citiesQuery.data || [];
    if (!projectCityIds) return [];
    return all.filter((option) => projectCityIds.has(String(option.value)));
  }, [citiesQuery.data, projectCityIds]);

  useEffect(() => {
    const validIds = new Set(cityOptions.map((c) => c.value));
    const current = getValues('cityIds') || [];
    const filtered = current.filter((id) => validIds.has(id));
    if (filtered.length !== current.length) {
      setValue('cityIds', filtered);
    }
  }, [cityOptions, setValue, getValues]);

  const headroom = selectedEmployeeId ? headroomFor(selectedEmployeeId) : null;

  const submit = handleSubmit(async (values) => {
    const pct = Number(values.allocationPct);
    const remaining = headroomFor(values.employeeId);
    if (pct > remaining) {
      setError('allocationPct', {
        message: `Only ${remaining}% remaining for this employee — total allocation cannot exceed 100%.`,
      });
      return;
    }

    setSubmitError(null);
    try {
      await onAdd(values);
      reset(allocationFormDefaults);
    } catch (error) {
      const appliedToField = applyServerErrors(error, setError, KNOWN_FIELDS);
      if (!appliedToField) {
        setSubmitError(error?.message || 'Something went wrong. Please try again.');
      }
    }
  });

  const usedPct = headroom != null ? 100 - headroom : 0;
  const cap = headroom ?? 100;
  const pctNumber = Number(allocationPct) || 0;
  const selectedEmployee = (employeesQuery.data || []).find((e) => String(e.id) === String(selectedEmployeeId));
  const currentRows = selectedEmployeeId && existingFor ? existingFor(selectedEmployeeId) : [];

  return (
    <Box
      component="form"
      onSubmit={submit}
      noValidate
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 290px', lg: 'minmax(0, 1fr) 340px' },
        gap: 2.5,
        alignItems: 'start',
      }}
    >
      <Card variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            '& > section': { px: 3, py: 2.5 },
            '& > section:not(:last-of-type)': { borderBottom: 1, borderColor: 'divider' },
          }}
        >
          <section>
            <SectionLabel step="1">Employee</SectionLabel>
            <RhfAutocomplete
              name="employeeId"
              control={control}
              label="Employee"
              required
              options={employeeOptions}
              placeholder="Type a name or employee ID"
              disabled={employeesQuery.isLoading}
            />
            {headroom != null && headroom <= 0 ? (
              <Alert severity="warning">This employee is already allocated 100%. Reduce another allocation first.</Alert>
            ) : null}
          </section>

          <section>
            <SectionLabel step="2">Assignment</SectionLabel>
            <Controller
              name="allocationType"
              control={control}
              render={({ field, fieldState }) => (
                <TypeSwitch value={field.value} onChange={field.onChange} error={fieldState.error?.message} />
              )}
            />
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid size={{ xs: 12, sm: isProjectAllocation ? 6 : 12 }}>
                <RhfAutocomplete
                  name="programmeId"
                  control={control}
                  label="Program"
                  required
                  options={programmeOptions}
                  placeholder="Type to search"
                  disabled={programmesQuery.isLoading}
                  helperText={programmeOptions.length === 0 ? 'No active programs configured.' : undefined}
                />
              </Grid>
              {isProjectAllocation ? (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <RhfAutocomplete
                    name="projectId"
                    control={control}
                    label="Project"
                    required
                    options={projectOptions}
                    placeholder={selectedProgrammeId ? 'Type to search' : undefined}
                    disabled={!selectedProgrammeId}
                    helperText={
                      !selectedProgrammeId
                        ? 'Select a program first.'
                        : projectOptions.length === 0
                          ? 'No projects under this program.'
                          : undefined
                    }
                  />
                </Grid>
              ) : null}
              <Grid size={12}>
                <RhfTextField
                  name="role"
                  control={control}
                  label={isProjectAllocation ? 'Role on project' : 'Role on program'}
                  placeholder="e.g. Field coordinator"
                />
              </Grid>
            </Grid>
          </section>

          <section>
            <SectionLabel step="3">Time share</SectionLabel>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Controller
                  name="allocationPct"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      {...field}
                      value={field.value ?? ''}
                      onChange={(event) => {
                        const raw = event.target.value;
                        if (raw === '') {
                          field.onChange('');
                          return;
                        }
                        const num = Number(raw);
                        if (Number.isNaN(num)) return;
                        field.onChange(num > cap ? String(cap) : raw);
                      }}
                      label="Allocation"
                      type="number"
                      required
                      placeholder="e.g. 40"
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message || `Up to ${cap}% available`}
                      fullWidth
                      slotProps={{
                        htmlInput: { min: 1, max: cap },
                        input: { endAdornment: <InputAdornment position="end">%</InputAdornment> },
                      }}
                    />
                  )}
                />
                <Stack direction="row" spacing={0.75} sx={{ mt: 0.5, flexWrap: 'wrap', rowGap: 0.75 }}>
                  {[25, 50, 75]
                    .filter((v) => v < cap)
                    .map((v) => (
                      <Chip
                        key={v}
                        size="small"
                        label={`${v}%`}
                        variant={pctNumber === v ? 'filled' : 'outlined'}
                        onClick={() => setValue('allocationPct', String(v), { shouldValidate: true })}
                      />
                    ))}
                  {cap > 0 ? (
                    <Chip
                      size="small"
                      label={cap === 100 ? 'Full 100%' : `All left · ${cap}%`}
                      variant={pctNumber === cap ? 'filled' : 'outlined'}
                      onClick={() => setValue('allocationPct', String(cap), { shouldValidate: true })}
                    />
                  ) : null}
                </Stack>
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <RhfTextField
                  name="startDate"
                  control={control}
                  label="Start date"
                  type="date"
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 4 }}>
                <RhfTextField
                  name="endDate"
                  control={control}
                  label="End date"
                  type="date"
                  helperText="Leave empty if open-ended."
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
            </Grid>
          </section>

          <section>
            <SectionLabel
              step="4"
              hint={
                geographySourceId
                  ? `Optional. Only the selected ${geographySourceLabel}'s states and cities can be picked.`
                  : 'Optional. Pick a program first.'
              }
            >
              Deployed to
            </SectionLabel>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RhfMultiSelect
                  name="stateIds"
                  control={control}
                  label="State"
                  options={effectiveStateOptions}
                  helperText={
                    !geographySourceId
                      ? 'Select a program first.'
                      : projectQuery.isLoading
                        ? `Loading ${geographySourceLabel}…`
                        : effectiveStateOptions.length === 0
                          ? `This ${geographySourceLabel} has no states configured.`
                          : undefined
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RhfMultiSelect
                  name="cityIds"
                  control={control}
                  label="City"
                  options={cityOptions}
                  helperText={
                    selectedStateIds.length === 0
                      ? 'Select a state first.'
                      : cityOptions.length === 0
                        ? `No cities of this ${geographySourceLabel} in the selected state(s).`
                        : undefined
                  }
                />
              </Grid>
              <Grid size={12}>
                <RhfTextField
                  name="remark"
                  control={control}
                  label="Remark"
                  placeholder="Any additional notes about this allocation…"
                  multiline
                  minRows={2}
                />
              </Grid>
            </Grid>
          </section>
        </Box>

        <Stack
          direction={{ xs: 'column-reverse', sm: 'row' }}
          sx={{
            px: 3,
            py: 1.75,
            gap: 1.5,
            alignItems: { sm: 'center' },
            justifyContent: 'space-between',
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'action.hover',
          }}
        >
          <Typography variant="body2" color={submitError ? 'error.main' : 'text.secondary'}>
            {submitError ||
              (headroom != null && pctNumber > 0
                ? `${pctNumber}% of this employee's time · ${Math.max(0, cap - pctNumber)}% left after`
                : 'Fields marked * are required.')}
          </Typography>
          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button onClick={onCancel} disabled={submitting} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<AddIcon />}
              disabled={submitting || headroom === 0}
              sx={{ fontWeight: 700, px: 3, whiteSpace: 'nowrap' }}
            >
              {submitting ? 'Adding…' : 'Add allocation'}
            </Button>
          </Stack>
        </Stack>
      </Card>

      {/* Right: the chosen employee's time, before and after this allocation. */}
      <Card variant="outlined" sx={{ borderRadius: 3, position: { md: 'sticky' }, top: { md: 88 } }}>
        <Box sx={{ px: 2.5, py: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="overline" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
            Employee&apos;s time
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {selectedEmployee ? selectedEmployee.name : 'No employee selected'}
          </Typography>
          {selectedEmployee ? (
            <Typography variant="caption" color="text.secondary">
              {selectedEmployee.empId} · {selectedEmployee.designationName}
            </Typography>
          ) : (
            <Typography variant="caption" color="text.secondary">
              Pick an employee to see how their time is already split.
            </Typography>
          )}
        </Box>
        {selectedEmployee ? (
          <Box sx={{ px: 2.5, py: 2 }}>
            <CapacityBar used={usedPct} adding={pctNumber} />
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mt: 2.5, mb: 1 }}>
              Current allocations
            </Typography>
            {currentRows.length ? (
              <Stack spacing={1}>
                {currentRows.map((r) => (
                  <Stack
                    key={r.id}
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{ px: 1.5, py: 1, border: 1, borderColor: 'divider', borderRadius: 2 }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                        {r.projectName || r.programmeName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap component="p">
                        {r.projectName ? `${r.programmeName} · ` : ''}
                        {r.role || 'No role set'}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {r.allocationPct}%
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                None running. This will be their only current allocation.
              </Typography>
            )}
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mt: 2.5, mb: 1 }}>
              Recent history
            </Typography>
            <AllocationHistory employeeId={selectedEmployeeId} limit={5} emptyText="No allocation changes yet." />
          </Box>
        ) : null}
      </Card>
    </Box>
  );
}
