import { useEffect, useMemo, useState } from 'react';
import { Button, DialogActions, DialogContent, Grid, Stack, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { RhfAutocomplete, RhfSelect, RhfMultiSelect, RhfTextField } from '../../../shared/components/index.js';
import { useEmployees } from '../../employee-list/hooks/useEmployees.js';
import { useProgramme, useProgrammes } from '../../donor-management/hooks/useProgrammes.js';
import { geographyService } from '../../donor-management/services/geographyService.js';
import { applyServerErrors } from '../../../lib/forms/applyServerErrors.js';
import { allocationSchema, allocationFormDefaults } from '../validation/allocationSchema.js';

const KNOWN_FIELDS = [
  'employeeId',
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
export function AllocationForm({ onAdd, headroomFor, onCancel, submitting }) {
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
    defaultValues: allocationFormDefaults,
  });

  const selectedEmployeeId = useWatch({ control, name: 'employeeId' });
  const selectedProgrammeId = useWatch({ control, name: 'programmeId' });
  const selectedProjectId = useWatch({ control, name: 'projectId' });
  const selectedStateIds = useWatch({ control, name: 'stateIds' }) || [];

  const projectOptions = (programmesQuery.data || [])
    .filter(
      (p) => p.isActive && p.type === 'Project' && String(p.parentProgrammeId) === String(selectedProgrammeId),
    )
    .map((p) => ({ value: p.id, label: p.programmeName }));

  // Drop a previously-picked project once it no longer belongs to the
  // selected program.
  useEffect(() => {
    const validIds = new Set(projectOptions.map((o) => o.value));
    const current = getValues('projectId');
    if (current && !validIds.has(current)) {
      setValue('projectId', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProgrammeId]);

  // An allocation's state/city must fall within the selected project's own
  // geography — the list response doesn't carry state/city ids, so the
  // project's full record is fetched once one is picked (same pattern as
  // ProgrammeForm's parent-geography restriction).
  const projectQuery = useProgramme(selectedProjectId || undefined);
  const projectStateIds = useMemo(
    () => (selectedProjectId && projectQuery.data ? new Set((projectQuery.data.stateIds || []).map(String)) : null),
    [selectedProjectId, projectQuery.data],
  );
  const projectCityIds = useMemo(
    () => (selectedProjectId && projectQuery.data ? new Set((projectQuery.data.cityIds || []).map(String)) : null),
    [selectedProjectId, projectQuery.data],
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

  return (
    <form onSubmit={submit} noValidate>
      <DialogContent dividers>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <RhfAutocomplete
              name="employeeId"
              control={control}
              label="Employee"
              required
              options={employeeOptions}
              placeholder="Select employee"
              disabled={employeesQuery.isLoading}
              helperText={
                headroom != null ? `${100 - headroom}% already allocated · ${headroom}% remaining` : undefined
              }
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <RhfSelect
              name="programmeId"
              control={control}
              label="Program"
              required
              options={programmeOptions}
              disabled={programmesQuery.isLoading}
              helperText={programmeOptions.length === 0 ? 'No active programs configured.' : undefined}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <RhfSelect
              name="projectId"
              control={control}
              label="Project"
              required
              options={projectOptions}
              disabled={!selectedProgrammeId}
              helperText={
                !selectedProgrammeId
                  ? 'Select a program first.'
                  : projectOptions.length === 0
                    ? 'No projects configured under this program.'
                    : undefined
              }
            />
          </Grid>

          <Grid size={12}>
            <RhfTextField
              name="role"
              control={control}
              label="Role on project"
              placeholder="e.g. Backend engineer"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <RhfMultiSelect
              name="stateIds"
              control={control}
              label="State"
              options={effectiveStateOptions}
              helperText={
                !selectedProjectId
                  ? 'Select a project first.'
                  : projectQuery.isLoading
                    ? 'Loading project…'
                    : effectiveStateOptions.length === 0
                      ? 'This project has no states configured.'
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
                    ? 'This project has no cities configured for the selected state(s).'
                    : undefined
              }
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Controller
              name="allocationPct"
              control={control}
              render={({ field, fieldState }) => {
                const cap = headroom ?? 100;
                return (
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
                    label="Allocation %"
                    type="number"
                    required
                    placeholder="e.g. 40"
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message || `Up to ${cap}% available` || ' '}
                    fullWidth
                    slotProps={{ htmlInput: { min: 1, max: cap } }}
                  />
                );
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <RhfTextField
              name="startDate"
              control={control}
              label="Start date"
              type="date"
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <RhfTextField
              name="endDate"
              control={control}
              label="End date"
              type="date"
              slotProps={{ inputLabel: { shrink: true } }}
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
      </DialogContent>

      <DialogActions sx={{ p: 2.5, flexDirection: 'column', alignItems: 'stretch' }}>
        {submitError ? (
          <Typography color="error.main" variant="body2" sx={{ mb: 1, textAlign: 'right' }}>
            {submitError}
          </Typography>
        ) : null}
        <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
          <Button onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<AddIcon />}
            disabled={submitting}
            sx={{ fontWeight: 700 }}
          >
            {submitting ? 'Adding…' : 'Add allocation'}
          </Button>
        </Stack>
      </DialogActions>
    </form>
  );
}
