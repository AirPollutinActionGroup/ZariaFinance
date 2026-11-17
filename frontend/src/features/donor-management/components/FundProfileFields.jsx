import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Controller, useFieldArray, useWatch } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { GeographyMultiSelect, RhfSelect, RhfTextField } from '../../../shared/components/index.js';
import { useProgrammes } from '../hooks/useProgrammes.js';
import { geographyService } from '../services/geographyService.js';
import { TrancheCard } from './TrancheCard.jsx';
import { UtilisationRuleRow } from './UtilisationRuleRow.jsx';
import { emptyCriterion } from '../mappers/disbursementMapper.js';
import { useRoleDesignations } from '../hooks/useRoleDesignations.js';
import { formatInrExact } from '../../../lib/format/currency.js';
import { ForeignContributionFields, formatForeign, inrFromForeign } from './ForeignContributionFields.jsx';

const FUND_MODE_OPTIONS = [
  { value: 'RESTRICTED', label: 'Restricted' },
  { value: 'UNRESTRICTED', label: 'Unrestricted' },
];
/** Labels mirror the backend FundClass enum; `mode` is the Fund mode each class belongs to. */
const FUND_CLASS_OPTIONS = [
  { value: 'CLASS_A_RESTRICTED', label: 'Class A – Restricted', mode: 'RESTRICTED' },
  { value: 'CLASS_B_UNRESTRICTED', label: 'Class B · Unrestricted w/ explanation', mode: 'UNRESTRICTED' },
  { value: 'CLASS_C_UNRESTRICTED', label: 'Class C · Fully unrestricted', mode: 'UNRESTRICTED' },
];
const REPORTING_OPTIONS = [
  { value: '', label: '—' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'HALF_YEARLY', label: 'Half-yearly' },
  { value: 'ANNUAL', label: 'Annual' },
];
const SCHEDULE_FREQUENCY_OPTIONS = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'HALF_YEARLY', label: 'Half-Yearly' },
  { value: 'YEARLY', label: 'Yearly' },
];
const LINK_TYPE_OPTIONS = [
  { value: '', label: 'Untied (no programme)' },
  { value: 'PROGRAMME', label: 'Programme' },
  { value: 'PROJECT', label: 'Project' },
];

/** Inline RHF-bound switch (booleans aren't covered by the shared form components). */
function RhfSwitch({ name, control, label, onChangeExtra, disabled = false, title }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControlLabel
          title={title}
          disabled={disabled}
          control={
            <Switch
              checked={Boolean(field.value)}
              onChange={(e) => {
                field.onChange(e.target.checked);
                onChangeExtra?.(e.target.checked);
              }}
            />
          }
          label={label}
        />
      )}
    />
  );
}

/**
 * Wraps one field section: its own Card by default, or — when the parent
 * already supplies the card (`bare`) — a padded block separated by a rule.
 */
function SectionShell({ bare, first = false, children }) {
  if (bare) {
    return (
      <Box sx={{ px: { xs: 2, md: 3 }, py: 2.5, borderTop: first ? 'none' : '1px solid', borderColor: 'divider' }}>
        {children}
      </Box>
    );
  }
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>{children}</CardContent>
    </Card>
  );
}

/** Form fields that trigger the Disbursement Schedule section's "required" state. */
export const DISBURSEMENT_ERROR_FIELDS = ['totalAmount', 'disbursementType', 'receivingDate', 'frequency', 'tranches'];

/**
 * The fund-profile field sections — Behaviour, Geographies, Utilisation rules
 * and Disbursement schedule — bound to a parent react-hook-form instance.
 * Shared by the stand-alone fund profile form and the combined Funding form,
 * so both always offer exactly the same fields and rules.
 *
 * The parent owns the form (useForm with fundProfileSchema fields at the top
 * level), submission, and whether the Disbursement section is open (so it can
 * open it on a validation error or when loading an existing schedule).
 *
 * `bookValue` is optional: leave it out when the parent already shows the
 * donor's book (the Funding form does), and the Behaviour row drops it.
 * `bare` renders the sections without their own cards, for a parent card.
 * `foreignBook` (FC donor) adds currency / amount / FX rate to the
 * Disbursement Schedule and derives the INR total from them.
 */
export function FundProfileFields({
  control,
  setValue,
  errors,
  bookValue,
  disbursementOpen,
  onDisbursementOpenChange,
  bare = false,
  foreignBook = false,
}) {
  // Compact headings when embedded in a parent card; the stand-alone page keeps its larger ones.
  const headingProps = bare
    ? { variant: 'subtitle1', component: 'h3', sx: { fontWeight: 700, fontSize: 15, lineHeight: 1.4, color: 'text.primary' } }
    : { variant: 'h4', component: 'h2' };
  const hintSx = { fontSize: 13, color: 'text.secondary', mt: 0.25 };

  // FC book: the INR total is derived from the foreign amount × FX rate.
  const fcCurrency = useWatch({ control, name: 'fcCurrency' });
  const fcAmount = useWatch({ control, name: 'fcAmount' });
  const fcRate = useWatch({ control, name: 'fcRate' });
  const derivedInr = foreignBook ? inrFromForeign(fcAmount, fcRate) : null;
  const fx = foreignBook ? { currency: fcCurrency, rate: fcRate } : null;
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const showBook = bookValue != null;
  const programmesQuery = useProgrammes();
  const { options: roleOptions } = useRoleDesignations();

  const [expandedIndex, setExpandedIndex] = useState(0);
  const [geographiesOpen, setGeographiesOpen] = useState(false);
  const [utilisationRulesOpen, setUtilisationRulesOpen] = useState(false);

  const utilisationRules = useFieldArray({ control, name: 'utilisationRules' });
  const tranches = useFieldArray({ control, name: 'tranches' });

  const disbursementType = useWatch({ control, name: 'disbursementType' });
  const frequency = useWatch({ control, name: 'frequency' });
  const trancheValues = useWatch({ control, name: 'tranches' });
  const totalAmountValue = useWatch({ control, name: 'totalAmount' });
  // Tranches vs the commitment — in the foreign currency for FC, else INR.
  const allocField = fx ? 'fcAmount' : 'amount';
  const allocCommitted = Number(fx ? fcAmount : totalAmountValue) || 0;
  const allocated = (trancheValues || []).reduce((sum, t) => sum + (Number(t?.[allocField]) || 0), 0);
  const remaining = allocCommitted - allocated;
  const allocState = Math.abs(remaining) < 0.005 ? 'full' : remaining > 0 ? 'under' : 'over';
  const fmtAlloc = (n) =>
    fx ? formatForeign(fcCurrency, n) : `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  const hasFinalTranche = (trancheValues || []).some((t) => Boolean(t?.isFinal));
  const programmeTied = useWatch({ control, name: 'programmeTied' });
  const fundMode = useWatch({ control, name: 'fundMode' });
  const isRestricted = fundMode === 'RESTRICTED';
  const isUnrestricted = fundMode === 'UNRESTRICTED';

  // Fund class follows Fund mode too: Restricted → Class A only;
  // Unrestricted → Class B or C. A class that no longer fits is replaced
  // (Restricted) or cleared so a B/C choice is made (Unrestricted).
  const fundClass = useWatch({ control, name: 'fundClass' });
  const classOptions = FUND_CLASS_OPTIONS.filter((o) => !fundMode || o.mode === fundMode);
  useEffect(() => {
    if (isRestricted && fundClass !== 'CLASS_A_RESTRICTED') {
      setValue('fundClass', 'CLASS_A_RESTRICTED', { shouldDirty: true, shouldValidate: Boolean(fundClass) });
    } else if (isUnrestricted && fundClass === 'CLASS_A_RESTRICTED') {
      setValue('fundClass', '', { shouldDirty: true });
    }
  }, [isRestricted, isUnrestricted, fundClass, setValue]);

  // Programme-tied follows Fund mode: Restricted money is always tied to a
  // programme (on), Unrestricted money never is (off — which also clears the
  // Programme/Project picked below).
  useEffect(() => {
    if (isRestricted && !programmeTied) setValue('programmeTied', true, { shouldDirty: true });
    if (isUnrestricted && programmeTied) setValue('programmeTied', false, { shouldDirty: true });
  }, [isRestricted, isUnrestricted, programmeTied, setValue]);
  const movementAllowed = useWatch({ control, name: 'movementAllowed' });
  const explanationRequired = useWatch({ control, name: 'explanationRequired' });
  const isPurposeRequired = movementAllowed && !programmeTied;
  const watchedProgrammeId = useWatch({ control, name: 'programmeId' });

  // A Project is a Programme row with type='Project' and a parentProgrammeId
  // — there's no separate Project entity (see Programme.java). A "Type"
  // picker decides which pickers are visible: Untied hides both, Programme
  // shows only the Programme picker, Project shows Programme (to narrow
  // down) followed by Project. Whichever is most specific is what's
  // submitted as programmeId. All three are local UI state, not RHF fields.
  const [linkType, setLinkType] = useState('');
  const [parentProgrammeId, setParentProgrammeId] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const cascadeInitialised = useRef(false);

  // Initialise the cascade once from whatever programmeId the form already
  // holds (edit mode) — runs once the programme list has loaded.
  useEffect(() => {
    if (cascadeInitialised.current) return;
    if (!watchedProgrammeId || !(programmesQuery.data || []).length) return;
    const current = (programmesQuery.data || []).find((p) => String(p.id) === String(watchedProgrammeId));
    if (!current) return;
    cascadeInitialised.current = true;
    if (current.type === 'Project') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time UI sync when async programme data first arrives
      setLinkType('PROJECT');
      setParentProgrammeId(String(current.parentProgrammeId || ''));
      setSelectedProjectId(String(current.id));
    } else {
      setLinkType('PROGRAMME');
      setParentProgrammeId(String(current.id));
      setSelectedProjectId('');
    }
  }, [watchedProgrammeId, programmesQuery.data]);

  // Whichever level is most specific (Project, else Programme, else untied)
  // is what actually gets submitted.
  useEffect(() => {
    const effective = selectedProjectId || parentProgrammeId || '';
    setValue('programmeId', effective, { shouldValidate: Boolean(effective) });
  }, [selectedProjectId, parentProgrammeId, setValue]);

  // Type/Programme/Project only make sense while Programme-tied is on —
  // switching it off clears the selection so the profile goes back to untied.
  useEffect(() => {
    if (!programmeTied && (linkType || parentProgrammeId || selectedProjectId)) {
      cascadeInitialised.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clearing the cascade in response to programmeTied turning off
      setLinkType('');
      setParentProgrammeId('');
      setSelectedProjectId('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to programmeTied turning off; the other values are what gets cleared, not triggers
  }, [programmeTied]);

  const handleLinkTypeChange = (newType) => {
    cascadeInitialised.current = true;
    setLinkType(newType);
    setParentProgrammeId('');
    setSelectedProjectId('');
  };
  const handleParentProgrammeChange = (newParentId) => {
    cascadeInitialised.current = true;
    setParentProgrammeId(newParentId);
    setSelectedProjectId('');
  };
  const selectedGeographies = useWatch({ control, name: 'selectedGeographies' }) || [];
  const statesQuery = useQuery({
    queryKey: ['geography', 'states'],
    queryFn: () => geographyService.listStates(),
    staleTime: 1000 * 60 * 60,
  });
  const stateNameById = new Map((statesQuery.data || []).map((s) => [String(s.value), s.label]));
  const geographySubtitle =
    !selectedGeographies || selectedGeographies.length === 0 || selectedGeographies.includes('ALL')
      ? 'No geographies — spendable anywhere'
      : selectedGeographies.map((id) => stateNameById.get(String(id)) || id).join(', ');

  // Movement allowed and Explanation required always move together — flipping
  // either one flips the other to match (see the two RhfSwitch handlers below
  // for the live user-driven side of this; this covers values loaded from an
  // existing fund profile that predates the pairing).
  useEffect(() => {
    if (movementAllowed !== explanationRequired) {
      setValue('explanationRequired', movementAllowed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to movementAllowed changing; explanationRequired is the target, not a trigger
  }, [movementAllowed, setValue]);

  const handleToggleUtilisationRules = () => {
    const nextState = !utilisationRulesOpen;
    setUtilisationRulesOpen(nextState);
    if (nextState && utilisationRules.fields.length === 0) {
      utilisationRules.append({ ruleType: 'ADMIN_OVERHEAD_COST', limitPercentage: '', description: '' });
    }
  };

  const parentProgrammeOptions = [
    { value: '', label: 'Select a programme…' },
    ...(programmesQuery.data || [])
      .filter((p) => p.type !== 'Project')
      .map((p) => ({ value: String(p.id), label: p.programmeName })),
  ];

  const projectOptions = [
    { value: '', label: parentProgrammeId ? 'Select a project…' : 'Select a programme first' },
    ...(programmesQuery.data || [])
      .filter((p) => p.type === 'Project' && parentProgrammeId && String(p.parentProgrammeId) === parentProgrammeId)
      .map((p) => ({ value: String(p.id), label: p.programmeName })),
  ];

  const hasDisbursementError = DISBURSEMENT_ERROR_FIELDS.some((field) => errors[field]);

  return (
    <>
      {/* Behaviour */}
      <SectionShell bare={bare} first>
          <Typography {...headingProps}>Behaviour</Typography>
          <Typography sx={{ ...hintSx, mb: 2 }}>Restriction class, reporting, and how strictly spending is tied.</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: showBook ? 3 : 4 }}>
              <RhfSelect name="fundMode" control={control} label="Fund mode" options={FUND_MODE_OPTIONS} required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: showBook ? 3 : 4 }}>
              <RhfSelect
                name="fundClass"
                control={control}
                label="Fund class"
                options={classOptions}
                required
                disabled={isRestricted}
                helperText={
                  isRestricted
                    ? 'Restricted funds are always Class A'
                    : isUnrestricted
                      ? 'Choose Class B or Class C'
                      : undefined
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: showBook ? 3 : 4 }}>
              <RhfSelect name="reportingFrequency" control={control} label="Reporting frequency" options={REPORTING_OPTIONS} />
            </Grid>
            {showBook ? (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <TextField
                  label="Book"
                  value={bookValue}
                  disabled
                  fullWidth
                  helperText="Derived from donor fund source domicile"
                />
              </Grid>
            ) : null}
            {/* Programme link — Fund mode decides whether it applies (Restricted: required). */}
            {programmeTied ? (
              <>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    select
                    fullWidth
                    label="Linked to"
                    required={isRestricted}
                    value={linkType}
                    onChange={(e) => handleLinkTypeChange(e.target.value)}
                    error={Boolean(errors.programmeId) && !linkType}
                    helperText={isRestricted ? 'Restricted funds tie to a Programme or Project' : 'Programme, Project, or nothing'}
                  >
                    {LINK_TYPE_OPTIONS.filter((option) => !(isRestricted && option.value === '')).map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    select
                    fullWidth
                    label="Programme"
                    required
                    disabled={!linkType}
                    value={parentProgrammeId}
                    onChange={(e) => handleParentProgrammeChange(e.target.value)}
                    error={Boolean(errors.programmeId) && !parentProgrammeId}
                    helperText={
                      errors.programmeId && !parentProgrammeId
                        ? 'Select a programme'
                        : linkType
                          ? ' '
                          : 'Choose what it links to first'
                    }
                  >
                    {parentProgrammeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    select
                    fullWidth
                    label="Project"
                    disabled={linkType !== 'PROJECT' || !parentProgrammeId}
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    helperText={
                      linkType !== 'PROJECT'
                        ? 'Only when linked to a Project'
                        : parentProgrammeId
                          ? 'Narrow to a specific project'
                          : 'Select a programme first'
                    }
                  >
                    {projectOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </>
            ) : null}

            {/* Budget-line movement rules. Programme-tied is set by Fund mode, so its
                switch only appears if no mode is chosen. */}
            <Grid size={{ xs: 12 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                sx={{
                  gap: { xs: 0.5, sm: 3 },
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  alignItems: { sm: 'center' },
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 150 }}>
                  Budget-line movement
                </Typography>
                {!isRestricted && !isUnrestricted ? (
                  <RhfSwitch name="programmeTied" control={control} label="Programme-tied" />
                ) : null}
                <RhfSwitch
                  name="movementAllowed"
                  control={control}
                  label="Movement allowed"
                  onChangeExtra={(checked) => setValue('explanationRequired', checked)}
                />
                <RhfSwitch
                  name="explanationRequired"
                  control={control}
                  label="Explanation required"
                  onChangeExtra={(checked) => setValue('movementAllowed', checked)}
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <RhfTextField
                name="purpose"
                control={control}
                label="Purpose"
                required={Boolean(isPurposeRequired)}
                helperText={isPurposeRequired ? 'Required when movement is allowed on untied money' : undefined}
              />
            </Grid>
          </Grid>
      </SectionShell>

      {/* Geographies */}
      <SectionShell bare={bare}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1, cursor: 'pointer' }} onClick={() => setGeographiesOpen((prev) => !prev)}>
            <Box>
              <Typography {...headingProps}>Geographies</Typography>
              <Typography sx={hintSx}>{geographySubtitle}</Typography>
            </Box>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); setGeographiesOpen((prev) => !prev); }}>
              {geographiesOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </Stack>
          <Collapse in={geographiesOpen}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mt: 1 }}>
              <GeographyMultiSelect
                name="selectedGeographies"
                control={control}
                label="Geography name"
                helperText="Select Indian states / UTs, or select All (defaults to 'No geographies — spendable anywhere' if left blank)"
              />
            </Box>
          </Collapse>
      </SectionShell>

      {/* Utilisation rules */}
      <SectionShell bare={bare}>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1, cursor: 'pointer' }}
            onClick={handleToggleUtilisationRules}
          >
            <Box>
              <Typography {...headingProps}>Utilisation Rules</Typography>
              <Typography sx={hintSx}>
                {utilisationRules.fields.length
                  ? `${utilisationRules.fields.length} limit${utilisationRules.fields.length === 1 ? '' : 's'} on cost categories`
                  : 'Optional limits, such as a cap on admin overhead'}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleUtilisationRules();
              }}
            >
              {utilisationRulesOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </Stack>
          <Collapse in={utilisationRulesOpen}>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={2}>
              {utilisationRules.fields.map((f, i) => (
                <Box key={f.id}>
                  {i > 0 ? <Divider sx={{ mb: 2 }} /> : null}
                  <UtilisationRuleRow
                    control={control}
                    path={`utilisationRules.${i}`}
                    index={i}
                    onRemove={() => utilisationRules.remove(i)}
                  />
                </Box>
              ))}
            </Stack>
            <Button size="small" startIcon={<AddIcon />} onClick={() => utilisationRules.append({ ruleType: 'ADMIN_OVERHEAD_COST', limitPercentage: '', description: '' })} sx={{ mt: 2 }}>
              Add rule
            </Button>
          </Collapse>
      </SectionShell>

      {/* Disbursement Schedule */}
      <SectionShell bare={bare}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1, cursor: 'pointer' }} onClick={() => onDisbursementOpenChange(!disbursementOpen)}>
            <Box>
              <Typography {...headingProps} sx={{ ...headingProps.sx, ...(hasDisbursementError ? { color: 'error.main' } : null) }}>
                Disbursement Schedule {hasDisbursementError ? '— required' : ''}
              </Typography>
              <Typography sx={hintSx}>
                Set how this grant is released. Choose a single payment or a series of tranches, then attach the conditions that must be met before each release.
              </Typography>
            </Box>
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDisbursementOpenChange(!disbursementOpen); }}>
              {disbursementOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </Stack>

          <Collapse in={disbursementOpen}>
            <Divider sx={{ my: 2.5 }} />

            {/* 1 · How it is released */}
            <Grid container spacing={3} sx={{ alignItems: 'flex-start', mb: 2.5 }}>
              <Grid size={{ xs: 12, md: 5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 13, mb: 0.75 }}>
                  Disbursement type *
                </Typography>
                <Controller
                  name="disbursementType"
                  control={control}
                  render={({ field }) => (
                    <Box
                      sx={{
                        display: 'inline-flex',
                        bgcolor: isDarkMode ? 'action.hover' : 'var(--canvas, #F6F6F3)',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1.5,
                        p: 0.5,
                        gap: 0.5,
                      }}
                    >
                      <Button
                        type="button"
                        onClick={() => field.onChange('LUMP_SUM')}
                        sx={{
                          px: 2.5,
                          py: 0.75,
                          borderRadius: 1.2,
                          fontWeight: 600,
                          fontSize: 13,
                          textTransform: 'none',
                          color: field.value === 'LUMP_SUM' ? (isDarkMode ? '#181818' : '#fff') : 'text.primary',
                          bgcolor: field.value === 'LUMP_SUM' ? (isDarkMode ? '#fff' : '#181818') : 'transparent',
                          '&:hover': {
                            bgcolor: field.value === 'LUMP_SUM' ? (isDarkMode ? '#e0e0e0' : '#000') : 'action.hover',
                          },
                        }}
                      >
                        Lump sum
                      </Button>
                      <Button
                        type="button"
                        onClick={() => field.onChange('TRANCHES')}
                        sx={{
                          px: 2.5,
                          py: 0.75,
                          borderRadius: 1.2,
                          fontWeight: 600,
                          fontSize: 13,
                          textTransform: 'none',
                          color: field.value === 'TRANCHES' ? (isDarkMode ? '#181818' : '#fff') : 'text.primary',
                          bgcolor: field.value === 'TRANCHES' ? (isDarkMode ? '#fff' : '#181818') : 'transparent',
                          '&:hover': {
                            bgcolor: field.value === 'TRANCHES' ? (isDarkMode ? '#e0e0e0' : '#000') : 'action.hover',
                          },
                        }}
                      >
                        Tranches
                      </Button>
                    </Box>
                  )}
                />
              </Grid>
              {disbursementType === 'LUMP_SUM' ? null : (
                <Grid size={{ xs: 12, md: 7 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 13, mb: 0.75 }}>
                    Schedule type *{' '}
                    <Typography component="span" variant="caption" sx={{ color: 'text.secondary', ml: 0.5 }}>
                      sets tranche frequency
                    </Typography>
                  </Typography>
                <Controller
                  name="frequency"
                  control={control}
                  render={({ field }) => (
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {SCHEDULE_FREQUENCY_OPTIONS.map((sched) => {
                        const selected = field.value === sched.value;
                        return (
                          <Chip
                            key={sched.value}
                            label={sched.label}
                            onClick={() => field.onChange(sched.value)}
                            sx={{
                              px: 1.5,
                              py: 2,
                              fontWeight: 600,
                              fontSize: 13,
                              borderRadius: 2,
                              cursor: 'pointer',
                              bgcolor: selected ? '#F2E041' : 'background.paper',
                              color: selected ? '#181818' : 'text.primary',
                              border: '1px solid',
                              borderColor: selected ? '#F2E041' : 'divider',
                              '&:hover': {
                                bgcolor: selected ? '#ecd730' : 'action.hover',
                              },
                            }}
                          />
                        );
                      })}
                    </Stack>
                  )}
                />
                </Grid>
              )}
            </Grid>

            {/* 2 · Foreign contribution (FC book) */}
            {foreignBook ? <ForeignContributionFields control={control} setValue={setValue} /> : null}

            {/* 3 · How much (and, for a lump sum, when) */}
            <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>
              {/* Total Amount Committed */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="totalAmount"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      type="number"
                      label={foreignBook ? 'Total amount committed (INR)' : 'Total amount committed'}
                      required
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder="1,00,00,000"
                      fullWidth
                      error={Boolean(fieldState.error)}
                      helperText={
                        fieldState.error?.message ||
                        (derivedInr != null
                          ? `= ${fcCurrency} ${Number(fcAmount).toLocaleString('en-IN')} × ₹${fcRate} · ${formatInrExact(derivedInr)}`
                          : foreignBook
                            ? 'Calculated from the foreign amount and FX rate above.'
                            : disbursementType === 'LUMP_SUM'
                              ? 'The full amount the donor has committed.'
                              : 'Total committed for this profile. All tranches must add up to this figure.')
                      }
                      slotProps={{
                        htmlInput: { min: 0, step: '1', readOnly: derivedInr != null },
                        input: {
                          startAdornment: (
                            <InputAdornment position="start" sx={{ color: 'text.primary', fontWeight: 700, fontFamily: 'monospace' }}>
                              ₹
                            </InputAdornment>
                          ),
                          sx: {
                            fontWeight: 600,
                            fontFamily: 'monospace',
                            fontSize: 15,
                            borderRadius: 1.5,
                            // Calculated from the FC fields — shaded to read as derived, not typed.
                            ...(derivedInr != null ? { bgcolor: 'var(--card2)' } : null),
                            '& ::placeholder': {
                              color: '#9a9a94',
                              opacity: 1,
                              fontWeight: 500,
                            },
                          },
                        },
                      }}
                    />
                  )}
                />
              </Grid>
              {disbursementType === 'LUMP_SUM' ? (
                <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="receivingDate"
                  control={control}
                  render={({ field, fieldState }) => (
                    <TextField
                      type="date"
                      label="Expected release date"
                      required
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value)}
                      fullWidth
                      error={Boolean(fieldState.error)}
                      helperText={fieldState.error?.message || 'The full committed amount is released on this date.'}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  )}
                />
                </Grid>
              ) : null}
            </Grid>

            {/* 4 · Tranches */}
            {disbursementType === 'LUMP_SUM' ? null : (
              <Box sx={{ mt: 1 }}>
                <Divider sx={{ my: 3 }} />

                {/* Releases -> Tranches Section inside Disbursement Schedule */}
                <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary', fontWeight: 700, fontSize: 11 }}>
                      RELEASES
                    </Typography>
                    <Typography {...headingProps} sx={{ ...headingProps.sx, mb: 0.5, fontWeight: 700 }}>
                      Tranches
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Add a tranche for each release. Each can carry one or more criteria that gate the payment.
                    </Typography>
                  </Box>
                  {tranches.fields.length === 0 && !hasFinalTranche ? (
                    <Button
                      type="button"
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        tranches.append({
                          trancheName: `Tranche ${tranches.fields.length + 1}`,
                          amount: '',
                          fcAmount: '',
                          expectedReleaseDate: '',
                          isFinal: false,
                          criteria: [emptyCriterion()],
                        });
                        setExpandedIndex(tranches.fields.length);
                      }}
                      sx={{
                        bgcolor: '#181818',
                        color: '#fff',
                        '&:hover': { bgcolor: '#000' },
                        fontWeight: 600,
                        textTransform: 'none',
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                      }}
                    >
                      Add tranche
                    </Button>
                  ) : null}
                </Stack>

                {tranches.fields.length > 0 && allocCommitted > 0 ? (
                  <Box
                    sx={{
                      mb: 2,
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      fontSize: 13,
                      bgcolor: { full: 'var(--ok-bg)', under: 'var(--warn-bg)', over: 'var(--err-bg)' }[allocState],
                      color: { full: 'var(--ok)', under: 'var(--warn)', over: 'var(--err)' }[allocState],
                    }}
                    role={allocState === 'over' ? 'alert' : undefined}
                  >
                    Allocated <strong>{fmtAlloc(allocated)}</strong> of {fmtAlloc(allocCommitted)} committed
                    {allocState === 'full'
                      ? ' — fully allocated'
                      : allocState === 'under'
                        ? ` · ${fmtAlloc(remaining)} left to allocate`
                        : ` · over by ${fmtAlloc(-remaining)} — tranches can't exceed the committed amount`}
                  </Box>
                ) : null}

                {tranches.fields.map((f, i) => (
                  <TrancheCard
                    key={f.id}
                    control={control}
                    index={i}
                    path={`tranches.${i}`}
                    expanded={expandedIndex === i}
                    onToggleExpanded={() => setExpandedIndex(expandedIndex === i ? null : i)}
                    onRemove={() => tranches.remove(i)}
                    frequencyLabel={SCHEDULE_FREQUENCY_OPTIONS.find((o) => o.value === frequency)?.label}
                    lumpSum={false}
                    isFinal={Boolean(f.isFinal)}
                    verificationRoleOptions={roleOptions}
                    responsibleRoleOptions={roleOptions}
                    fx={fx}
                    setValue={setValue}
                  />
                ))}

                {/* Add Tranche Button below tranche cards (Right Aligned) */}
                {tranches.fields.length > 0 && !hasFinalTranche ? (
                  <Stack direction="row" sx={{ justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      type="button"
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        tranches.append({
                          trancheName: `Tranche ${tranches.fields.length + 1}`,
                          amount: '',
                          fcAmount: '',
                          expectedReleaseDate: '',
                          isFinal: false,
                          criteria: [emptyCriterion()],
                        });
                        setExpandedIndex(tranches.fields.length);
                      }}
                      sx={{
                        bgcolor: '#181818',
                        color: '#fff',
                        '&:hover': { bgcolor: '#000' },
                        fontWeight: 600,
                        textTransform: 'none',
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                      }}
                    >
                      Add tranche
                    </Button>
                  </Stack>
                ) : null}

                {tranches.fields.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No tranches yet — use &ldquo;Add tranche&rdquo;.
                  </Typography>
                ) : null}
              </Box>
            )}
          </Collapse>
      </SectionShell>
    </>
  );
}
