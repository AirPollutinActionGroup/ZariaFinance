import { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, FormControlLabel, Grid, Stack, Switch, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ErrorState,
  LoadingState,
  PageHeader,
  RhfAutocomplete,
  RhfTextField,
  StatusChip,
} from '../../../shared/components/index.js';
import { queryKeys } from '../../../lib/query/queryKeys.js';
import { formatInrExact } from '../../../lib/format/currency.js';
import { useDonors } from '../../donor-management/hooks/useDonors.js';
import { fundProfileService } from '../../donor-management/services/fundProfileService.js';
import { grantService } from '../../donor-management/services/grantService.js';
import { toFundProfileFormValues } from '../../donor-management/mappers/fundProfileMapper.js';
import { grantFormDefaults } from '../../donor-management/validation/grantSchema.js';
import { DISBURSEMENT_ERROR_FIELDS, FundProfileFields } from '../../donor-management/components/FundProfileFields.jsx';
import { useFundingRecord } from '../hooks/useFunding.js';
import { FormStep } from '../components/FormStep.jsx';
import SaveIcon from '@mui/icons-material/Save';
import { agreementFormDefaults, fundingFormDefaults, fundingSchema } from '../validation/fundingSchema.js';

const AGREEMENT_FIELDS = Object.keys(agreementFormDefaults);

const factLabelSx = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'text.secondary',
};

/** LC / FC — the donor's book. Shown once, under the donor (and in the summary). */
function bookOf(donor) {
  if (!donor) return null;
  return donor.fundSourceDomicile === 'FOREIGN' ? 'FC · Foreign contribution' : 'LC · Local contribution';
}

/** "12 months" / "45 days" between two ISO dates (inclusive), or null. */
function periodLength(start, end) {
  if (!start || !end || end < start) return null;
  const days = Math.round((new Date(end) - new Date(start)) / 86_400_000) + 1;
  if (days < 60) return `${days} day${days === 1 ? '' : 's'}`;
  return `${Math.round(days / 30.44)} months`;
}

/**
 * The backend requires an agreement name, but the form doesn't ask for one:
 * keep an existing agreement's name, else use the purpose, else donor + code.
 */
function agreementNameFor(grant, values, savedProfile, donor) {
  const name =
    grant?.agreementName ||
    values.purpose?.trim() ||
    [savedProfile.donorName || donor?.donorName, savedProfile.profileCode].filter(Boolean).join(' · ');
  return name.slice(0, 200);
}

/** Pick only the agreement fields out of grant form values. */
function agreementValuesOf(grant) {
  const all = grantService.toFormValues(grant);
  return Object.fromEntries(AGREEMENT_FIELDS.map((k) => [k, all[k] ?? '']));
}

/** The chosen donor at a glance: name, code, and the facts that follow from it. */
function DonorFacts({ donor }) {
  if (!donor) {
    return (
      <Typography variant="body2" color="text.secondary">
        Pick a donor to see their book and FCRA status.
      </Typography>
    );
  }
  const foreign = donor.fundSourceDomicile === 'FOREIGN';
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          flexShrink: 0,
          borderRadius: 2,
          display: 'grid',
          placeItems: 'center',
          bgcolor: 'var(--card2)',
          fontWeight: 700,
          fontSize: 16,
        }}
      >
        {(donor.donorName || '?').trim().charAt(0).toUpperCase()}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
          {donor.donorName}
          <Box component="span" sx={{ ml: 1, color: 'text.secondary', fontFamily: 'monospace', fontWeight: 400, fontSize: 12 }}>
            {donor.donorCode}
          </Box>
        </Typography>
        <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap', mt: 0.5 }}>
          <StatusChip label={`Book: ${bookOf(donor)}`} tone={foreign ? 'graphite' : 'neutral'} />
          {foreign ? (
            <StatusChip
              label={donor.fcraApplicable ? 'FCRA applicable' : 'FCRA not applicable'}
              tone={donor.fcraApplicable ? 'warning' : 'outlined'}
            />
          ) : null}
          {donor.donorTypeLabel && donor.donorTypeLabel !== '—' ? (
            <StatusChip label={donor.donorTypeLabel} tone="outlined" />
          ) : null}
        </Stack>
      </Box>
    </Stack>
  );
}

/**
 * The single Funding form: who the money is from, the terms attached to it
 * (fund profile) and the signed grant agreement — saved together.
 *
 * Saving is two calls on the existing APIs: create/update the fund profile,
 * then create/update the grant on it. If the second call fails after the
 * profile was created, the created profile is remembered so the next save
 * updates it instead of creating a duplicate.
 */
function FundingForm({ mode, profile, grant, donors, initialValues }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = mode === 'edit';
  const [savedProfile, setSavedProfile] = useState(null);
  const [disbursementOpen, setDisbursementOpen] = useState(true);

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors },
  } = useForm({ resolver: zodResolver(fundingSchema), defaultValues: initialValues });

  // Watch the whole form: the summary panel and step markers update live.
  const values = useWatch({ control });
  const { donorId, withAgreement, totalAmount } = values;
  const agreement = values.agreement || {};

  const donor = donors.find((d) => String(d.id) === String(donorId));
  const foreignBook = donor?.fundSourceDomicile === 'FOREIGN';

  // FC fields are required for a new FC-book funding (they derive the INR total).
  useEffect(() => {
    setValue('requireFc', foreignBook && !isEdit);
    setValue('fcActive', foreignBook);
  }, [foreignBook, isEdit, setValue]);
  const donorOptions = donors.map((d) => ({ value: String(d.id), label: `${d.donorName} (${d.donorCode})` }));

  const save = useMutation({
    mutationFn: async (formValues) => {
      // 1 · Terms
      const existing = profile || savedProfile;
      const saved = existing
        ? await fundProfileService.updateProfile(existing.id, formValues)
        : await fundProfileService.createProfile(Number(formValues.donorId), formValues);
      if (!existing) setSavedProfile(saved);

      // 2 · Agreement (create or update), on the profile just saved
      if (formValues.withAgreement) {
        const grantValues = {
          ...(grant ? grantService.toFormValues(grant) : grantFormDefaults),
          ...formValues.agreement,
          agreementName: agreementNameFor(grant, formValues, saved, donor),
          donorId: String(formValues.donorId),
          fundProfileId: String(saved.id),
        };
        if (grant) await grantService.updateGrant(grant.id, grantValues);
        else await grantService.createGrant(grantValues);
      }
      return saved;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fundProfiles.all() });
      queryClient.invalidateQueries({ queryKey: queryKeys.grants.all() });
    },
  });

  const submit = handleSubmit(
    async (formValues) => {
      try {
        const saved = await save.mutateAsync(formValues);
        navigate(`/funding/${saved.id}`, { replace: true });
      } catch (error) {
        // Server-side field errors: agreement fields live under `agreement.`.
        for (const [field, message] of Object.entries(error?.fieldErrors || {})) {
          setError(AGREEMENT_FIELDS.includes(field) ? `agreement.${field}` : field, { type: 'server', message });
        }
      }
    },
    (formErrors) => {
      const disbursementFields = [...DISBURSEMENT_ERROR_FIELDS, 'fcCurrency', 'fcAmount', 'fcRateDate', 'fcRate'];
      if (disbursementFields.some((field) => formErrors[field])) setDisbursementOpen(true);
    },
  );

  const errorMessages = [
    ...Object.entries(errors)
      .filter(([key, e]) => key !== 'agreement' && !Array.isArray(e) && e?.message)
      .map(([, e]) => e.message),
    ...(errors.tranches ? ['One or more tranches have missing or invalid fields'] : []),
    ...Object.values(errors.agreement || {})
      .map((e) => e?.message)
      .filter(Boolean)
      .map((m) => `Agreement: ${m}`),
  ];

  const backTo = isEdit ? `/funding/${profile.id}` : '/funding';
  const dateProps = { type: 'date', slotProps: { inputLabel: { shrink: true } } };
  const committed = Number(totalAmount) > 0 ? formatInrExact(totalAmount) : null;
  const pendingProfile = profile || savedProfile;
  const period = periodLength(agreement.startDate, agreement.endDate);
  const donorLocked = isEdit || Boolean(savedProfile);
  const scheduleReady =
    values.disbursementType === 'LUMP_SUM' ? Boolean(values.receivingDate) : (values.tranches || []).length > 0;

  const steps = [
    { label: 'Donor chosen', status: donor ? 'done' : 'todo' },
    { label: 'Class & payment schedule set', status:
        values.fundClass && committed && scheduleReady && (!values.programmeTied || values.programmeId) ? 'done' : 'todo' },
    {
      label: withAgreement ? 'Agreement dates set' : 'Agreement — add later',
      status: !withAgreement
        ? 'skipped'
        : agreement.agreementDate && agreement.startDate && agreement.endDate
          ? 'done'
          : 'todo',
    },
  ];

  return (
    <Box
      component="form"
      onSubmit={submit}
      noValidate
      sx={{ maxWidth: 1040 }}
    >
      <Box sx={{ minWidth: 0 }}>
        {save.error || errorMessages.length ? (
          <Stack spacing={1.5} sx={{ mb: 3 }}>
            {save.error ? (
              <Alert severity="error">
                {savedProfile && !profile
                  ? `Terms saved as ${savedProfile.profileCode}, but the agreement could not be saved: ${save.error.message}. Fix it and save again — the terms won't be duplicated.`
                  : save.error.message}
              </Alert>
            ) : null}
            {errorMessages.length ? (
              <Alert severity="error">
                <Stack spacing={0.25}>
                  {[...new Set(errorMessages)].map((message) => (
                    <Typography key={message} variant="body2">
                      {message}
                    </Typography>
                  ))}
                </Stack>
              </Alert>
            ) : null}
          </Stack>
        ) : null}

        <Stack spacing={2.5}>
        {/* 1 · Donor — the only place in the form the book (LC / FC) is shown */}
        <FormStep id="step-donor" step={1} total={3} title="Donor" subtitle="Whose money this is." status={steps[0].status}>
              <RhfAutocomplete
                name="donorId"
                control={control}
                label="Donor"
                required
                options={donorOptions}
                placeholder="Search by name or code…"
                disabled={donorLocked}
                helperText={donorLocked ? 'The donor cannot change once the terms are saved' : undefined}
              />
              <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
                <DonorFacts donor={donor} />
              </Box>
        </FormStep>

        {/* 2 · Terms (fund profile) — no bookValue passed, so no second Book field */}
        <FormStep
          id="step-terms"
          step={2}
          total={3}
          flush
          title="Terms"
          subtitle="How the money may be used — restriction class, spending rules, and when it arrives."
          status={steps[1].status}
        >
          <FundProfileFields
            control={control}
            setValue={setValue}
            errors={errors}
            disbursementOpen={disbursementOpen}
            onDisbursementOpenChange={setDisbursementOpen}
            bare
            foreignBook={foreignBook}
          />
        </FormStep>

        {/* 3 · Agreement (grant) */}
        <FormStep
          id="step-agreement"
          step={3}
          total={3}
          title="Grant agreement"
          subtitle={withAgreement ? 'The signed agreement on these terms.' : 'Skipped for now — record it later from the funding page.'}
          status={steps[2].status}
          action={
            grant ? null : (
              <Controller
                name="withAgreement"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    sx={{ mr: 0, flexShrink: 0, '& .MuiFormControlLabel-label': { fontSize: 13, fontWeight: 600 } }}
                    control={<Switch checked={Boolean(field.value)} onChange={(e) => field.onChange(e.target.checked)} />}
                    label="Record now"
                    labelPlacement="start"
                  />
                )}
              />
            )
          }
        >
          {withAgreement ? (
            <>
                {grant ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Grant code{' '}
                    <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'text.primary' }}>
                      {grant.grantCode}
                    </Box>
                  </Typography>
                ) : null}

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <RhfTextField name="agreement.agreementDate" control={control} label="Signed on" required {...dateProps} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <RhfTextField name="agreement.startDate" control={control} label="Start date" required {...dateProps} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <RhfTextField name="agreement.endDate" control={control} label="End date" required {...dateProps} />
                  </Grid>
                </Grid>

                {/* Read-only facts that follow from the terms and the dates. */}
                <Box
                  sx={{
                    mt: 2,
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    borderRadius: 2,
                    bgcolor: 'var(--card2)',
                    '& > *': { px: 2, py: 1.25 },
                    '& > *:first-of-type': {
                      borderRight: { sm: '1px solid' },
                      borderBottom: { xs: '1px solid', sm: 'none' },
                      borderColor: 'divider',
                    },
                  }}
                >
                  <Box>
                    <Typography sx={factLabelSx}>Grant amount</Typography>
                    <Typography sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{committed || '—'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      From the payment schedule in step 2
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={factLabelSx}>Agreement period</Typography>
                    <Typography sx={{ fontWeight: 700 }}>{period || '—'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {period ? 'Start to end, inclusive' : 'Set the start and end dates'}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 2.5 }}>
                  <RhfTextField name="agreement.description" control={control} label="Remarks (optional)" multiline minRows={2} />
                </Box>

                {/* Document picker — records the file name only. */}
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  sx={{ mt: 2, p: 1.5, borderRadius: 2, border: '1px dashed', borderColor: 'divider', alignItems: { sm: 'center' } }}
                >
                  <Stack direction="row" spacing={1.25} sx={{ flex: 1, minWidth: 0, alignItems: 'center' }}>
                    <EventNoteOutlinedIcon sx={{ color: 'text.secondary' }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                        {agreement.agreementDocumentPath || 'Signed agreement document'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Optional · only the file name is recorded, the file is not uploaded
                      </Typography>
                    </Box>
                  </Stack>
                  <Button component="label" variant="outlined" size="small" startIcon={<UploadFileIcon />} sx={{ whiteSpace: 'nowrap' }}>
                    {agreement.agreementDocumentPath ? 'Change file' : 'Choose file'}
                    <input
                      type="file"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setValue('agreement.agreementDocumentPath', file.name);
                      }}
                    />
                  </Button>
                </Stack>
            </>
          ) : (
            <Box sx={{ px: 2.5, py: 2, borderRadius: 2, border: '1px dashed', borderColor: 'divider', color: 'text.secondary', fontSize: 14 }}>
              Only the terms will be saved. The funding shows as <strong>Terms only</strong> until an agreement is recorded.
            </Box>
          )}
        </FormStep>
        </Stack>
      </Box>

      {/* Save bar — sticks to the bottom of the viewport on this long form. */}
      <Card
        sx={{
          position: 'sticky',
          bottom: 16,
          zIndex: 2,
          mt: 2.5,
          px: { xs: 2, md: 3 },
          py: 1.5,
          display: 'flex',
          gap: 1.5,
          alignItems: 'center',
          flexWrap: 'wrap',
          boxShadow: 'var(--shadow)',
        }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1, minWidth: 200 }}>
          {pendingProfile
            ? [pendingProfile.profileCode, grant?.grantCode].filter(Boolean).join(' · ')
            : 'Codes are assigned automatically on save'}
          {!isEdit && withAgreement ? ' · agreement starts as pending approval' : ''}
        </Typography>
        <Button color="inherit" onClick={() => navigate(backTo)} disabled={save.isPending}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={save.isPending}>
          {save.isPending ? 'Saving…' : isEdit ? 'Save changes' : withAgreement ? 'Save funding' : 'Save terms'}
        </Button>
      </Card>
    </Box>
  );
}

/**
 * /funding/new[?donorId=]            — new funding (terms + agreement)
 * /funding/:id/edit[?step=agreement] — edit both; `step=agreement` turns on
 *                                      "Record now" when there's no agreement yet.
 */
export function FundingFormPage({ mode }) {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const donorsQuery = useDonors('');
  const record = useFundingRecord(mode === 'edit' ? id : null);
  const isEdit = mode === 'edit';

  const loading = donorsQuery.isPending || (isEdit && (record.profileQuery.isPending || record.grantQuery.isPending));
  if (loading) return <LoadingState label="Loading funding form…" />;
  const failed = [donorsQuery, ...(isEdit ? [record.profileQuery, record.grantQuery] : [])].find((q) => q.isError);
  if (failed) return <ErrorState error={failed.error} onRetry={failed.refetch} />;

  const { profile, grant } = record;
  const initialValues = isEdit
    ? {
        ...fundingFormDefaults,
        ...toFundProfileFormValues(profile),
        donorId: String(profile.donorId),
        withAgreement: Boolean(grant) || searchParams.get('step') === 'agreement',
        agreement: grant ? agreementValuesOf(grant) : agreementFormDefaults,
      }
    : { ...fundingFormDefaults, donorId: searchParams.get('donorId') || '' };

  return (
    <>
      <Button
        startIcon={<ArrowBackIcon />}
        size="small"
        sx={{ mb: 1, color: 'text.secondary' }}
        onClick={() => navigate(isEdit ? `/funding/${id}` : '/funding')}
      >
        {isEdit ? 'Back to funding' : 'Funding Agreements'}
      </Button>
      <PageHeader
        eyebrow={isEdit ? [profile.profileCode, grant?.grantCode].filter(Boolean).join(' · ') : null}
        title={isEdit ? 'Edit funding' : 'New funding'}
        subtitle="The donor, the terms attached to their money, and the agreement signed on them — saved together."
      />
      <FundingForm
        mode={mode}
        profile={profile}
        grant={grant}
        donors={donorsQuery.data || []}
        initialValues={initialValues}
      />
    </>
  );
}
