import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Alert, Box, Button, Card, CardContent, Collapse, Grid, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { RhfTextField, RhfSelect, RhfMultiSelect } from '../../../shared/components/index.js';
import { geographyService } from '../services/geographyService.js';
import { applyServerErrors } from '../../../lib/forms/applyServerErrors.js';
import { useProgramme, useProgrammes } from '../hooks/useProgrammes.js';
import { PROGRAMME_TYPES } from '../constants.js';
import { programmeSchema, programmeFormDefaults } from '../validation/programmeSchema.js';
import { ProgrammeStatusBar } from './ProgrammeStatusBar.jsx';

function SectionTitle({ children }) {
  return (
    <Typography
      variant="overline"
      color="text.secondary"
      sx={{ display: 'block', fontWeight: 700, letterSpacing: '0.08em', mb: 2 }}
    >
      {children}
    </Typography>
  );
}

function formatDuration(startDate, endDate) {
  if (!startDate || !endDate) return null;
  const days = Math.round((new Date(endDate) - new Date(startDate)) / 86400000);
  if (days < 0) return 'End date is before start date';
  return `Runs ${days} ${days === 1 ? 'day' : 'days'}`;
}

/** The Programme/Project create form. */
export function ProgrammeForm({ defaultValues, onSubmit, submitting, submitError, onCancel }) {
  const [stateOptions, setStateOptions] = useState([]);

  useEffect(() => {
    geographyService
      .listStates(1)
      .then((data) => setStateOptions(data || []))
      .catch((err) => console.error('Error fetching states:', err));
  }, []);

  const programmesQuery = useProgrammes();
  // A parent must itself be a Programme, not a Project (the backend enforces the same rule) —
  // any lifecycle status is fine, a Planned/On Hold programme can still have projects under it.
  const programmeOptions = (programmesQuery.data || [])
    .filter((programme) => programme.type !== 'Project')
    .map((programme) => ({ value: String(programme.id), label: programme.programmeName }));

  const { control, handleSubmit, setError, setValue, getValues } = useForm({
    resolver: zodResolver(programmeSchema),
    defaultValues: defaultValues || programmeFormDefaults,
  });

  const selectedType = useWatch({ control, name: 'type' });
  const selectedParentId = useWatch({ control, name: 'parentProgrammeId' });
  const selectedStateIds = useWatch({ control, name: 'stateIds' }) || [];
  const startDate = useWatch({ control, name: 'startDate' });
  const endDate = useWatch({ control, name: 'endDate' });
  const duration = formatDuration(startDate, endDate);

  // Parent programme only applies to Project — clear it when switching back
  // to Programme. Compared against the last settled type (not "skip first
  // run") so this survives React StrictMode's double effect on mount.
  const settledType = useRef(defaultValues?.type ?? programmeFormDefaults.type);
  useEffect(() => {
    if (selectedType === settledType.current) return;
    settledType.current = selectedType;
    if (selectedType !== 'Project') {
      setValue('parentProgrammeId', '');
    }
  }, [selectedType, setValue]);

  // A Project's geography must be a subset of its parent Programme's — fetch
  // the parent's full record (list rows don't carry state/city ids) once one
  // is picked, and use it to narrow the State/City options below.
  const isProject = selectedType === 'Project';
  const parentQuery = useProgramme(isProject && selectedParentId ? selectedParentId : undefined);
  const parentName = parentQuery.data?.programmeName;
  const parentStartDate = isProject ? parentQuery.data?.startDate : undefined;
  const parentEndDate = isProject ? parentQuery.data?.endDate : undefined;
  // A Project's own dates must fall within its parent's — the picker's
  // selectable range is bounded by whichever is stricter (its own paired
  // date, or the parent's), and the submit handler below double-checks it.
  const startDateMin = parentStartDate || undefined;
  const startDateMax = [endDate, parentEndDate].filter(Boolean).sort()[0];
  const endDateMin = [startDate, parentStartDate].filter(Boolean).sort().pop();
  const endDateMax = parentEndDate || undefined;
  const parentStateIds = useMemo(
    () => (isProject && parentQuery.data ? new Set((parentQuery.data.stateIds || []).map(String)) : null),
    [isProject, parentQuery.data],
  );
  const parentCityIds = useMemo(
    () => (isProject && parentQuery.data ? new Set((parentQuery.data.cityIds || []).map(String)) : null),
    [isProject, parentQuery.data],
  );

  // Unrestricted for a Programme; for a Project, only the parent's own states
  // (empty until a parent is chosen and loaded).
  const effectiveStateOptions = useMemo(() => {
    if (!isProject) return stateOptions;
    if (!parentStateIds) return [];
    return stateOptions.filter((option) => parentStateIds.has(String(option.value)));
  }, [isProject, parentStateIds, stateOptions]);

  useEffect(() => {
    const validIds = new Set(effectiveStateOptions.map((s) => s.value));
    const currentStateIds = getValues('stateIds') || [];
    const filtered = currentStateIds.filter((id) => validIds.has(id));
    if (filtered.length !== currentStateIds.length) {
      setValue('stateIds', filtered);
    }
  }, [effectiveStateOptions, setValue, getValues]);

  // City options are the union of cities across every selected state, further
  // narrowed to the parent's own cities for a Project.
  const selectedStateIdsKey = selectedStateIds.join(',');
  const citiesQuery = useQuery({
    queryKey: ['programme-city-options', selectedStateIdsKey],
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
    if (!parentCityIds) return all;
    return all.filter((option) => parentCityIds.has(String(option.value)));
  }, [citiesQuery.data, parentCityIds]);

  useEffect(() => {
    const validIds = new Set(cityOptions.map((c) => c.value));
    const currentCityIds = getValues('cityIds') || [];
    const filtered = currentCityIds.filter((id) => validIds.has(id));
    if (filtered.length !== currentCityIds.length) {
      setValue('cityIds', filtered);
    }
  }, [cityOptions, setValue, getValues]);

  const submit = handleSubmit(async (values) => {
    if (isProject && parentStartDate && values.startDate && values.startDate < parentStartDate) {
      setError('startDate', { message: `Must be on or after the parent programme's start date (${parentStartDate}).` });
      return;
    }
    if (isProject && parentEndDate && values.endDate && values.endDate > parentEndDate) {
      setError('endDate', { message: `Must be on or before the parent programme's end date (${parentEndDate}).` });
      return;
    }
    try {
      await onSubmit(values);
    } catch (error) {
      applyServerErrors(error, setError);
    }
  });

  return (
    <Card component="form" onSubmit={submit} noValidate variant="outlined" sx={{ borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={4}>
          {submitError && !submitError.fieldErrors ? <Alert severity="error">{submitError.message}</Alert> : null}

          <Box>
            <SectionTitle>Classification</SectionTitle>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12 }}>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <ToggleButtonGroup
                      exclusive
                      value={field.value}
                      onChange={(_event, value) => value && field.onChange(value)}
                      color="primary"
                    >
                      {PROGRAMME_TYPES.map((type) => (
                        <ToggleButton key={type} value={type} sx={{ textTransform: 'none', fontWeight: 600, px: 3 }}>
                          {type}
                        </ToggleButton>
                      ))}
                    </ToggleButtonGroup>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Collapse in={selectedType === 'Project'} unmountOnExit>
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <RhfSelect
                        name="parentProgrammeId"
                        control={control}
                        label="Parent programme"
                        required
                        disabled={programmesQuery.isLoading}
                        options={programmeOptions}
                        helperText={
                          programmesQuery.isLoading
                            ? 'Loading programmes…'
                            : programmeOptions.length === 0
                              ? 'No programmes configured yet.'
                              : 'Every project must belong to one programme.'
                        }
                      />
                    </Grid>
                  </Grid>
                </Collapse>
              </Grid>
            </Grid>
          </Box>

          <Box>
            <SectionTitle>Details</SectionTitle>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12 }}>
                <RhfTextField
                  name="programmeName"
                  control={control}
                  label="Name"
                  required
                  placeholder="e.g. Delhi NCR Stubble Burning Mitigation FY26"
                  helperText="Programme code is assigned automatically"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <RhfTextField
                  name="startDate"
                  control={control}
                  label="Start date"
                  type="date"
                  slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: startDateMin, max: startDateMax } }}
                  helperText={isProject && parentStartDate ? `On or after the parent's start (${parentStartDate}).` : undefined}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RhfTextField
                  name="endDate"
                  control={control}
                  label="End date"
                  type="date"
                  slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: endDateMin, max: endDateMax } }}
                  helperText={duration || (isProject && parentEndDate ? `On or before the parent's end (${parentEndDate}).` : ' ')}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <RhfMultiSelect
                  name="stateIds"
                  control={control}
                  label="State"
                  options={effectiveStateOptions}
                  helperText={
                    stateOptions.length === 0
                      ? 'Loading states…'
                      : isProject && !selectedParentId
                        ? 'Select a parent programme first.'
                        : isProject && parentQuery.isLoading
                          ? 'Loading parent programme…'
                          : isProject
                            ? effectiveStateOptions.length === 0
                              ? `${parentName || 'Parent programme'} has no states configured.`
                              : `Limited to ${parentName || 'the parent programme'}'s states.`
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
                      : citiesQuery.isFetching
                        ? 'Loading cities…'
                        : cityOptions.length === 0
                          ? isProject
                            ? `No cities of the selected state(s) are configured on ${parentName || 'the parent programme'}.`
                            : 'No cities found for the selected state(s).'
                          : undefined
                  }
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <RhfTextField
                  name="description"
                  control={control}
                  label="Description"
                  multiline
                  minRows={2}
                  placeholder="What this programme covers"
                />
              </Grid>
            </Grid>
          </Box>

          <Box>
            <SectionTitle>Status</SectionTitle>
            <Controller
              name="status"
              control={control}
              render={({ field }) => <ProgrammeStatusBar value={field.value} onChange={field.onChange} />}
            />
          </Box>

          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button color="inherit" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save record'}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
