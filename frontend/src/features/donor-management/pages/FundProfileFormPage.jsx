import { useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/Save';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader, LoadingState, ErrorState } from '../../../shared/components/index.js';
import { RhfSelect, RhfTextField } from '../../../shared/components/index.js';
import { formatInrExact } from '../../../lib/format/currency.js';
import { useProgrammes } from '../hooks/useProgrammes.js';
import {
  useCreateFundProfile,
  useFundProfile,
  useUpdateFundProfile,
} from '../hooks/useFundProfiles.js';
import { fundProfileSchema, fundProfileFormDefaults } from '../validation/fundProfileSchema.js';
import { toFundProfileFormValues } from '../mappers/fundProfileMapper.js';

const FUND_MODE_OPTIONS = [
  { value: 'Restricted', label: 'Restricted' },
  { value: 'Unrestricted', label: 'Unrestricted' },
];
const FUND_CLASS_OPTIONS = [
  { value: '', label: '— none (edge / pending) —' },
  { value: 'A', label: 'Class A · Fully restricted' },
  { value: 'B', label: 'Class B · Unrestricted w/ explanation' },
  { value: 'C', label: 'Class C · Fully unrestricted' },
];
const REPORTING_OPTIONS = [
  { value: '', label: '—' },
  { value: 'Quarterly', label: 'Quarterly' },
  { value: 'Half-yearly', label: 'Half-yearly' },
  { value: 'Annual', label: 'Annual' },
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
  const { donorId: donorIdParam, id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const profileQuery = useFundProfile(isEdit ? id : null);
  const programmesQuery = useProgrammes();
  const donorId = isEdit ? profileQuery.data?.donorId : Number(donorIdParam);

  const createMutation = useCreateFundProfile(donorId);
  const updateMutation = useUpdateFundProfile(id, donorId);
  const mutation = isEdit ? updateMutation : createMutation;

  const { control, handleSubmit, reset } = useForm({
    resolver: zodResolver(fundProfileSchema),
    defaultValues: fundProfileFormDefaults,
  });

  const geographies = useFieldArray({ control, name: 'geographies' });
  const utilisationRules = useFieldArray({ control, name: 'utilisationRules' });
  const disbursementRules = useFieldArray({ control, name: 'disbursementRules' });
  const tranches = useFieldArray({ control, name: 'tranches' });

  // Σ of the tranche plan — mirrors FundProfileResponse.plannedTotalAmount, which
  // becomes the Total Grant Amount of every grant on this profile.
  const trancheValues = useWatch({ control, name: 'tranches' });
  const plannedTotal = (trancheValues || []).reduce((sum, t) => {
    const amount = Number(t?.trancheAmount);
    return Number.isFinite(amount) ? sum + amount : sum;
  }, 0);

  // Populate the form once the profile loads (edit mode only).
  useEffect(() => {
    if (isEdit && profileQuery.data) {
      reset(toFundProfileFormValues(profileQuery.data));
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
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <RhfSelect name="fundMode" control={control} label="Fund mode" options={FUND_MODE_OPTIONS} required />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <RhfSelect name="fundClassCode" control={control} label="Fund class (A/B/C)" options={FUND_CLASS_OPTIONS} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <RhfSelect name="reportingFrequency" control={control} label="Reporting frequency" options={REPORTING_OPTIONS} />
                </Grid>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <RhfTextField name="purpose" control={control} label="Purpose" />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <RhfTextField name="overheadLimitPercent" control={control} label="Overhead cap %" type="number" />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <RhfSelect name="programmeId" control={control} label="Programme" options={programmeOptions} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Stack direction="row" flexWrap="wrap" sx={{ gap: 1 }}>
                    <RhfSwitch name="programmeTied" control={control} label="Programme-tied" />
                    <RhfSwitch name="adminAllowed" control={control} label="Admin allowed" />
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
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h4" component="h2">Permitted geographies</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={() => geographies.append({ geographyName: '' })}>
                  Add
                </Button>
              </Stack>
              {geographies.fields.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No geographies — spendable anywhere.</Typography>
              ) : null}
              <Stack spacing={1.5}>
                {geographies.fields.map((f, i) => (
                  <Stack key={f.id} direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
                    <RhfTextField name={`geographies.${i}.geographyName`} control={control} label="Geography" required />
                    <IconButton aria-label="Remove geography" onClick={() => geographies.remove(i)} sx={{ mt: 1 }}>
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Utilisation rules */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h4" component="h2">Utilisation rules</Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => utilisationRules.append({ ruleType: '', limitPercentage: '', description: '' })}
                >
                  Add
                </Button>
              </Stack>
              <Stack spacing={2}>
                {utilisationRules.fields.map((f, i) => (
                  <Box key={f.id}>
                    {i > 0 ? <Divider sx={{ mb: 2 }} /> : null}
                    <Grid container spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                      <Grid size={{ xs: 12, sm: 5 }}>
                        <RhfTextField name={`utilisationRules.${i}.ruleType`} control={control} label="Rule type" required />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 2 }}>
                        <RhfTextField name={`utilisationRules.${i}.limitPercentage`} control={control} label="Limit %" type="number" />
                      </Grid>
                      <Grid size={{ xs: 11, sm: 4 }}>
                        <RhfTextField name={`utilisationRules.${i}.description`} control={control} label="Description" />
                      </Grid>
                      <Grid size={{ xs: 1 }}>
                        <IconButton aria-label="Remove rule" onClick={() => utilisationRules.remove(i)} sx={{ mt: 1 }}>
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Disbursement rules */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h4" component="h2">Disbursement rules</Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() =>
                    disbursementRules.append({
                      ruleType: '',
                      releaseTrigger: '',
                      minPriorUtilisationRequired: '',
                      milestoneRequired: false,
                      ruleDescription: '',
                    })
                  }
                >
                  Add
                </Button>
              </Stack>
              <Stack spacing={2}>
                {disbursementRules.fields.map((f, i) => (
                  <Box key={f.id}>
                    {i > 0 ? <Divider sx={{ mb: 2 }} /> : null}
                    <Grid container spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <RhfTextField name={`disbursementRules.${i}.ruleType`} control={control} label="Rule type" required />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <RhfTextField name={`disbursementRules.${i}.releaseTrigger`} control={control} label="Release trigger" />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <RhfTextField name={`disbursementRules.${i}.minPriorUtilisationRequired`} control={control} label="Prior util %" type="number" />
                      </Grid>
                      <Grid size={{ xs: 1 }}>
                        <IconButton aria-label="Remove rule" onClick={() => disbursementRules.remove(i)} sx={{ mt: 1 }}>
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 8 }}>
                        <RhfTextField name={`disbursementRules.${i}.ruleDescription`} control={control} label="Description" />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <RhfSwitch name={`disbursementRules.${i}.milestoneRequired`} control={control} label="Milestone required" />
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>

          {/* Tranche plan — Σ becomes the Total Grant Amount on this profile's grants */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="h4" component="h2">Tranche plan</Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => tranches.append({ trancheName: '', trancheAmount: '', plannedReleaseDate: '' })}
                >
                  Add tranche
                </Button>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                The release schedule agreed with the donor. Every grant on this profile inherits the total below as its
                Total Grant Amount, so leaving this empty means grants commit nothing.
              </Typography>
              <Stack spacing={2}>
                {tranches.fields.map((f, i) => (
                  <Box key={f.id}>
                    {i > 0 ? <Divider sx={{ mb: 2 }} /> : null}
                    <Grid container spacing={1.5} sx={{ alignItems: 'flex-start' }}>
                      {/* Tranche numbers are positional — the backend renumbers 1..n on save. */}
                      <Grid size={{ xs: 12, sm: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                          #{i + 1}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <RhfTextField name={`tranches.${i}.trancheName`} control={control} label="Tranche name" />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <RhfTextField
                          name={`tranches.${i}.trancheAmount`}
                          control={control}
                          label="Amount"
                          required
                          type="number"
                          slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                        />
                      </Grid>
                      <Grid size={{ xs: 11, sm: 3 }}>
                        <RhfTextField
                          name={`tranches.${i}.plannedReleaseDate`}
                          control={control}
                          label="Planned release"
                          type="date"
                          slotProps={{ inputLabel: { shrink: true } }}
                        />
                      </Grid>
                      <Grid size={{ xs: 1 }}>
                        <IconButton aria-label="Remove tranche" onClick={() => tranches.remove(i)} sx={{ mt: 1 }}>
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="subtitle2">Planned total</Typography>
                <Typography variant="subtitle2">{formatInrExact(plannedTotal)}</Typography>
              </Stack>
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
