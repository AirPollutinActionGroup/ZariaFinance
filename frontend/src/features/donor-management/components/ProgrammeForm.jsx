import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Alert, Box, Button, Card, Collapse, Grid, Stack, Typography } from '@mui/material';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { RhfAutocomplete, RhfTextField, RhfSelect, RhfMultiSelect } from '../../../shared/components/index.js';
import { geographyService } from '../services/geographyService.js';
import { formatDate } from '../../../lib/format/date.js';
import { applyServerErrors } from '../../../lib/forms/applyServerErrors.js';
import { useProgramme, useProgrammes } from '../hooks/useProgrammes.js';
import { PROGRAMME_STATUSES, PROGRAMME_STATUS_TONE, PROGRAMME_TYPES } from '../constants.js';
import { programmeSchema, programmeFormDefaults } from '../validation/programmeSchema.js';

/** A light bordered group of fields with a small icon + title. */
function Panel({ icon: Icon, title, hint, children, sx }) {
  return (
    <Box
      component="section"
      sx={{ border: 1, borderColor: 'divider', borderRadius: 2.5, bgcolor: 'background.paper', p: 2.5, ...sx }}
    >
      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: hint ? 0.25 : 2 }}>
        <Box
          sx={{
            width: 30,
            height: 30,
            borderRadius: 1.5,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'action.hover',
            color: 'text.secondary',
            flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: 18 }} />
        </Box>
        <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {title}
        </Typography>
      </Stack>
      {hint ? (
        <Typography variant="caption" color="text.secondary" component="p" sx={{ ml: 5.25, mb: 2 }}>
          {hint}
        </Typography>
      ) : null}
      {children}
    </Box>
  );
}

const TYPE_OPTION = {
  Programme: { icon: AccountTreeOutlinedIcon, hint: 'Parent record — projects sit under it' },
  Project: { icon: AssignmentOutlinedIcon, hint: 'Sits under one parent programme' },
};

/** Segmented Programme / Project switch for the card header. */
function TypeSwitch({ value, onChange }) {
  return (
    <Box
      role="radiogroup"
      aria-label="Type"
      sx={{ display: 'inline-flex', p: 0.5, gap: 0.5, borderRadius: 999, bgcolor: 'action.hover', border: 1, borderColor: 'divider' }}
    >
      {PROGRAMME_TYPES.map((type) => {
        const selected = value === type;
        const Icon = TYPE_OPTION[type]?.icon;
        return (
          <Box
            key={type}
            component="button"
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(type)}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              px: 2,
              py: 0.9,
              border: 0,
              borderRadius: 999,
              font: 'inherit',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              color: selected ? 'background.paper' : 'text.secondary',
              bgcolor: selected ? 'text.primary' : 'transparent',
              transition: 'background-color 0.15s, color 0.15s',
              '&:hover': { color: selected ? 'background.paper' : 'text.primary' },
              '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: 2 },
            }}
          >
            {Icon ? <Icon sx={{ fontSize: 18 }} /> : null}
            {type}
          </Box>
        );
      })}
    </Box>
  );
}

const STATUS_DOT = { neutral: 'text.disabled', success: 'success.main', warning: 'warning.main', info: 'info.main', graphite: 'text.primary' };

/** Status options for the select, each with its colour dot. */
const STATUS_OPTIONS = PROGRAMME_STATUSES.map((status) => ({
  value: status,
  label: (
    <Stack direction="row" spacing={1} alignItems="center" component="span">
      <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: STATUS_DOT[PROGRAMME_STATUS_TONE[status]] }} />
      <span>{status}</span>
    </Stack>
  ),
}));

function formatDuration(startDate, endDate) {
  if (!startDate || !endDate) return null;
  const days = Math.round((new Date(endDate) - new Date(startDate)) / 86400000);
  if (days < 0) return 'End date is before start date';
  return `Runs ${days + 1} ${days === 0 ? 'day' : 'days'}`;
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

  const kindLabel = isProject ? 'project' : 'programme';
  const kindTitle = isProject ? 'Project' : 'Programme';
  const parentWindow =
    isProject && (parentStartDate || parentEndDate)
      ? `${parentStartDate ? formatDate(parentStartDate) : '…'} – ${parentEndDate ? formatDate(parentEndDate) : '…'}`
      : null;

  return (
    <Card component="form" onSubmit={submit} noValidate sx={{ overflow: 'hidden' }}>
      {/* Header: what is being created + the Programme / Project switch */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          px: 3,
          py: 2,
          gap: 1.5,
          alignItems: { sm: 'center' },
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
            {kindTitle} details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {TYPE_OPTION[selectedType]?.hint}
          </Typography>
        </Box>
        <Controller
          name="type"
          control={control}
          render={({ field }) => <TypeSwitch value={field.value} onChange={field.onChange} />}
        />
      </Stack>

      <Box sx={{ p: 3, bgcolor: 'action.hover' }}>
        {submitError && !submitError.fieldErrors ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError.message}
          </Alert>
        ) : null}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Panel icon={DescriptionOutlinedIcon} title="Basic information" sx={{ height: '100%' }}>
              <Stack spacing={1}>
                <Collapse in={isProject} unmountOnExit>
                  <RhfAutocomplete
                    name="parentProgrammeId"
                    placeholder="Type to search programmes"
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
                          : 'The programme this project belongs to.'
                    }
                  />
                </Collapse>
                <RhfTextField
                  name="programmeName"
                  control={control}
                  label={`${kindTitle} name`}
                  required
                  placeholder={isProject ? 'e.g. Secondary School Science Kits' : 'e.g. Delhi NCR Stubble Burning Mitigation FY26'}
                />
                <RhfTextField
                  name="description"
                  control={control}
                  label="Description"
                  multiline
                  minRows={isProject ? 2 : 4}
                  placeholder={`What this ${kindLabel} covers`}
                />
              </Stack>
            </Panel>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Panel icon={EventOutlinedIcon} title="Schedule & status" sx={{ height: '100%' }}>
              <Stack spacing={1}>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 6, md: 12, lg: 6 }}>
                    <RhfTextField
                      name="startDate"
                      control={control}
                      label="Start date"
                      type="date"
                      slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: startDateMin, max: startDateMax } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, md: 12, lg: 6 }}>
                    <RhfTextField
                      name="endDate"
                      control={control}
                      label="End date"
                      type="date"
                      slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: endDateMin, max: endDateMax } }}
                    />
                  </Grid>
                </Grid>
                {duration || parentWindow ? (
                  <Box
                    sx={{
                      mt: -1,
                      mb: 1,
                      px: 1.5,
                      py: 1,
                      borderRadius: 1.5,
                      bgcolor: 'action.hover',
                      fontSize: 12.5,
                      color: 'text.secondary',
                    }}
                  >
                    {duration ? (
                      <Box component="span" sx={{ fontWeight: 600, color: duration.startsWith('End date') ? 'error.main' : 'text.primary' }}>
                        {duration}
                      </Box>
                    ) : null}
                    {duration && parentWindow ? ' · ' : null}
                    {parentWindow ? `Parent runs ${parentWindow}` : null}
                  </Box>
                ) : null}
                <RhfSelect
                  name="status"
                  control={control}
                  label="Status"
                  options={STATUS_OPTIONS}
                  helperText="Can be changed later from its page."
                />
              </Stack>
            </Panel>
          </Grid>

          <Grid size={12}>
            <Panel
              icon={PlaceOutlinedIcon}
              title="Location"
              hint={
                isProject
                  ? `Optional · only ${parentName || 'the parent programme'}'s states and cities can be picked`
                  : 'Optional · the states and cities the work covers'
              }
            >
              <Grid container spacing={2}>
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
                            : isProject && effectiveStateOptions.length === 0
                              ? `${parentName || 'Parent programme'} has no states configured.`
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
                            ? 'No cities available for the selected state(s).'
                            : undefined
                    }
                  />
                </Grid>
              </Grid>
            </Panel>
          </Grid>
        </Grid>
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
        }}
      >
        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ color: 'text.secondary' }}>
          <InfoOutlinedIcon sx={{ fontSize: 16 }} />
          <Typography variant="caption">The {kindLabel} code is assigned automatically when you save.</Typography>
        </Stack>
        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button color="inherit" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitting} sx={{ px: 3 }}>
            {submitting ? 'Saving…' : `Save ${kindLabel}`}
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
