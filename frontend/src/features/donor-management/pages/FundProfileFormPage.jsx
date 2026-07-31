import { useEffect, useState } from 'react';
import {
  Alert,
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
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SaveIcon from '@mui/icons-material/Save';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, LoadingState, ErrorState } from '../../../shared/components/index.js';
import { GeographyMultiSelect, RhfSelect, RhfTextField } from '../../../shared/components/index.js';
import { useProgrammes } from '../hooks/useProgrammes.js';
import { useDonor } from '../hooks/useDonors.js';
import {
  useCreateFundProfile,
  useFundProfile,
  useUpdateFundProfile,
} from '../hooks/useFundProfiles.js';
import { fundProfileSchema, fundProfileFormDefaults } from '../validation/fundProfileSchema.js';
import { toFundProfileFormValues } from '../mappers/fundProfileMapper.js';
import { TrancheCard } from '../components/TrancheCard.jsx';
import { UtilisationRuleRow } from '../components/UtilisationRuleRow.jsx';
import { emptyCriterion, VERIFICATION_ROLES } from '../mappers/disbursementMapper.js';

const FUND_MODE_OPTIONS = [
  { value: 'RESTRICTED', label: 'Restricted' },
  { value: 'UNRESTRICTED', label: 'Unrestricted' },
];
const FUND_CLASS_OPTIONS = [
  { value: '', label: '— none (edge / pending) —' },
  { value: 'CLASS_A_RESTRICTED', label: 'Class A · Fully restricted' },
  { value: 'CLASS_B_UNRESTRICTED', label: 'Class B · Unrestricted w/ explanation' },
  { value: 'CLASS_C_UNRESTRICTED', label: 'Class C · Fully unrestricted' },
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

/** Inline RHF-bound switch (booleans aren't covered by the shared form components). */
function RhfSwitch({ name, control, label }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControlLabel
          control={<Switch checked={Boolean(field.value)} onChange={(e) => field.onChange(e.target.checked)} />}
          label={label}
        />
      )}
    />
  );
}

/** Create / edit a donor fund profile with its geography and rule collections. */
export function FundProfileFormPage() {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';
  const { donorId: donorIdParam, id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const profileQuery = useFundProfile(isEdit ? id : null);
  const programmesQuery = useProgrammes();
  const donorId = isEdit ? profileQuery.data?.donorId : Number(donorIdParam);
  const donorQuery = useDonor(donorId);
  const isForeign = donorQuery.data?.fundSourceDomicile === 'FOREIGN';
  const bookValue = isForeign ? 'FC · Foreign contribution' : 'LC · Local contribution';

  const createMutation = useCreateFundProfile(donorId);
  const updateMutation = useUpdateFundProfile(id, donorId);
  const mutation = isEdit ? updateMutation : createMutation;

  const [expandedIndex, setExpandedIndex] = useState(0);
  const [disbursementScheduleOpen, setDisbursementScheduleOpen] = useState(false);
  const [geographiesOpen, setGeographiesOpen] = useState(false);
  const [utilisationRulesOpen, setUtilisationRulesOpen] = useState(false);

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(fundProfileSchema),
    defaultValues: fundProfileFormDefaults,
  });

  const utilisationRules = useFieldArray({ control, name: 'utilisationRules' });
  const tranches = useFieldArray({ control, name: 'tranches' });

  const disbursementType = useWatch({ control, name: 'disbursementType' });
  const frequency = useWatch({ control, name: 'frequency' });
  const trancheValues = useWatch({ control, name: 'tranches' });
  const hasFinalTranche = (trancheValues || []).some((t) => Boolean(t?.isFinal));
  const programmeTied = useWatch({ control, name: 'programmeTied' });
  const selectedGeographies = useWatch({ control, name: 'selectedGeographies' }) || [];
  const geographySubtitle =
    !selectedGeographies || selectedGeographies.length === 0 || selectedGeographies.includes('ALL')
      ? 'No geographies — spendable anywhere'
      : selectedGeographies.join(', ');

  const handleToggleUtilisationRules = () => {
    const nextState = !utilisationRulesOpen;
    setUtilisationRulesOpen(nextState);
    if (nextState && utilisationRules.fields.length === 0) {
      utilisationRules.append({ ruleType: 'ADMIN_OVERHEAD_COST', limitPercentage: '', description: '' });
    }
  };

  // Populate the form once the profile loads (edit mode only).
  useEffect(() => {
    if (isEdit && profileQuery.data) {
      reset(toFundProfileFormValues(profileQuery.data));
      if (profileQuery.data.disbursementRules && profileQuery.data.disbursementRules.length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time UI sync when async profile data first arrives
        setDisbursementScheduleOpen(true);
      }
    }
  }, [isEdit, profileQuery.data, reset]);

  if (isEdit && profileQuery.isPending) return <LoadingState label="Loading fund profile…" />;
  if (isEdit && profileQuery.isError) {
    return <ErrorState error={profileQuery.error} onRetry={profileQuery.refetch} />;
  }

  const programmeOptions = [
    { value: '', label: 'Untied (no programme)' },
    ...(programmesQuery.data || []).map((p) => ({ value: p.id, label: p.programmeName })),
  ];

  const backTo = donorId ? `/donors/${donorId}` : '/donors';

  const submit = handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
    navigate(backTo, { replace: true });
  });

  return (
    <>
      <PageHeader
        title={isEdit ? 'Edit fund profile' : 'New fund profile'}
        subtitle="How this donor's money may be used — mode, class, movement and reporting rules"
      />

      <Box component="form" onSubmit={submit} noValidate>
        <Stack spacing={3}>
          {mutation.error ? <Alert severity="error">{mutation.error.message}</Alert> : null}

          {/* Behaviour */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
                Behaviour
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <RhfSelect name="fundMode" control={control} label="Fund mode" options={FUND_MODE_OPTIONS} required />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <RhfSelect name="fundClass" control={control} label="Fund class (A/B/C)" options={FUND_CLASS_OPTIONS} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <RhfSelect name="reportingFrequency" control={control} label="Reporting frequency" options={REPORTING_OPTIONS} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <TextField
                    label="Book"
                    value={bookValue}
                    disabled
                    fullWidth
                    helperText="Derived from donor fund source domicile"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <RhfTextField name="purpose" control={control} label="Purpose" />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <RhfSelect
                    name="programmeId"
                    control={control}
                    label={programmeTied ? 'Programme *' : 'Programme'}
                    required={Boolean(programmeTied)}
                    options={programmeOptions}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Stack direction="row" flexWrap="wrap" sx={{ gap: 1 }}>
                    <RhfSwitch name="programmeTied" control={control} label="Programme-tied" />
                    <RhfSwitch name="movementAllowed" control={control} label="Movement allowed" />
                    <RhfSwitch name="explanationRequired" control={control} label="Explanation required" />
                    <RhfSwitch name="onboardingComplete" control={control} label="Onboarding complete" />
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Geographies */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1, cursor: 'pointer' }} onClick={() => setGeographiesOpen((prev) => !prev)}>
                <Box>
                  <Typography variant="h4" component="h2">Geographies</Typography>
                  <Typography variant="body2" color="text.secondary">{geographySubtitle}</Typography>
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
            </CardContent>
          </Card>

          {/* Utilisation rules */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack
                direction="row"
                sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1, cursor: 'pointer' }}
                onClick={handleToggleUtilisationRules}
              >
                <Box>
                  <Typography variant="h4" component="h2">Utilisation Rules</Typography>
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
            </CardContent>
          </Card>

          {/* Disbursement Schedule */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1, cursor: 'pointer' }} onClick={() => setDisbursementScheduleOpen((prev) => !prev)}>
                <Box>
                  <Typography variant="h4" component="h2">Disbursement Schedule</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Set how this grant is released. Choose a single payment or a series of tranches, then attach the conditions that must be met before each release.
                  </Typography>
                </Box>
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDisbursementScheduleOpen((prev) => !prev); }}>
                  {disbursementScheduleOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
              </Stack>

              <Collapse in={disbursementScheduleOpen}>
                <Divider sx={{ my: 2.5 }} />

                <Grid container spacing={3} sx={{ alignItems: 'flex-start', mb: 2.5 }}>
                  {/* Total Amount Committed */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 13, mb: 0.75 }}>
                      Total amount committed *
                    </Typography>
                    <Controller
                      name="totalAmount"
                      control={control}
                      render={({ field, fieldState }) => (
                        <TextField
                          type="number"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value)}
                          placeholder="1,00,00,000"
                          fullWidth
                          error={Boolean(fieldState.error)}
                          slotProps={{
                            htmlInput: { min: 0, step: '1' },
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
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                      Total committed for this profile. All tranches must add up to this figure.
                    </Typography>
                  </Grid>

                  {/* Disbursement Type */}
                  <Grid size={{ xs: 12, sm: 6 }}>
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
                </Grid>

                {/* Conditional View: Lump sum vs Tranches */}
                {disbursementType === 'LUMP_SUM' ? (
                  <Box sx={{ maxWidth: 360, mt: 2.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 13, mb: 0.75 }}>
                      Receiving date *
                    </Typography>
                    <Controller
                      name="receivingDate"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          type="date"
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value)}
                          fullWidth
                          slotProps={{ inputLabel: { shrink: true } }}
                        />
                      )}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
                      The full committed amount is released on this date.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ mt: 2.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: 13, mb: 0.75 }}>
                      Schedule type *{' '}
                      <Typography component="span" variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', ml: 0.5 }}>
                        sets tranche frequency
                      </Typography>
                    </Typography>
                    <Controller
                      name="frequency"
                      control={control}
                      render={({ field }) => (
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
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

                    <Divider sx={{ my: 3 }} />

                    {/* Releases -> Tranches Section inside Disbursement Schedule */}
                    <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                      <Box>
                        <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: 'text.secondary', fontWeight: 700, fontSize: 11 }}>
                          RELEASES
                        </Typography>
                        <Typography variant="h4" component="h2" sx={{ mb: 0.5, fontWeight: 700 }}>
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
                        responsibleRoleOptions={VERIFICATION_ROLES}
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
            </CardContent>
          </Card>

          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
            <Button color="inherit" onClick={() => navigate(backTo)}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create profile'}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </>
  );
}
