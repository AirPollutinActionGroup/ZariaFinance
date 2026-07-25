import { useEffect, useRef } from 'react';
import { Alert, Button, Card, CardContent, Grid, Stack, TextField, Typography } from '@mui/material';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RhfSelect, RhfTextField } from '../../../shared/components/index.js';
import { applyServerErrors } from '../../../lib/forms/applyServerErrors.js';
import { grantSchema, grantFormDefaults } from '../validation/grantSchema.js';
import { useFundProfilesByDonor } from '../hooks/useFundProfiles.js';
import { useProgrammes } from '../hooks/useProgrammes.js';

const CURRENCY_OPTIONS = ['INR', 'USD', 'GBP', 'EUR'].map((c) => ({ value: c, label: c }));

const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 });

/**
 * Grant agreement creation form.
 *
 * A grant inherits its donor and class from a fund profile: pick a donor to
 * scope the profile list, then pick one of that donor's fund profiles. The
 * programme defaults to the profile's programme but can be overridden here.
 *
 * The grant code is auto-generated server-side (ZRY/GA/YYYY/NNN) and shown
 * read-only. Foreign grants carry a currency + locked FX rate (forced to 1 for
 * INR); the INR reporting amount is Total × FX.
 */
export function GrantForm({
  donors,
  defaultValues,
  onSubmit,
  submitting,
  submitError,
  onCancel,
  submitLabel = 'Create grant',
}) {
  const { control, handleSubmit, setValue, setError } = useForm({
    resolver: zodResolver(grantSchema),
    defaultValues: defaultValues || grantFormDefaults,
  });

  const donorId = useWatch({ control, name: 'donorId' });
  const grantCode = useWatch({ control, name: 'grantCode' });
  const grantCurrency = useWatch({ control, name: 'grantCurrency' });
  const totalGrantAmount = useWatch({ control, name: 'totalGrantAmount' });
  const fxLockedRate = useWatch({ control, name: 'fxLockedRate' });

  const profilesQuery = useFundProfilesByDonor(donorId ? Number(donorId) : null);
  const programmesQuery = useProgrammes();

  // When the donor changes, clear a now-invalid fund-profile selection — but not
  // on the initial render, which would wipe a profile prefilled in edit mode.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setValue('fundProfileId', '');
  }, [donorId, setValue]);

  // INR grants report at par: force the FX rate to 1 and lock the field.
  const isInr = (grantCurrency || 'INR') === 'INR';
  useEffect(() => {
    if (isInr) setValue('fxLockedRate', '1');
  }, [isInr, setValue]);

  const donorOptions = donors.map((donor) => ({
    value: String(donor.id),
    label: `${donor.donorName} (${donor.donorCode})`,
  }));

  const profileOptions = (profilesQuery.data || []).map((p) => ({
    value: String(p.id),
    label: `${p.fundClassCode ? `Class ${p.fundClassCode}` : 'Unclassed'} · ${p.fundModeLabel} · ${
      p.programmeName || 'Untied'
    }${p.purpose ? ` — ${p.purpose}` : ''}`,
  }));

  const programmeOptions = [
    { value: '', label: 'Inherit from fund profile' },
    ...(programmesQuery.data || []).map((p) => ({
      value: String(p.id),
      label: `${p.programmeCode} · ${p.programmeName}`,
    })),
  ];

  const reportingAmountInr =
    Number(totalGrantAmount) > 0 && Number(fxLockedRate) > 0
      ? INR.format(Number(totalGrantAmount) * Number(fxLockedRate))
      : '—';

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      applyServerErrors(error, setError);
    }
  });

  const dateProps = { type: 'date', slotProps: { inputLabel: { shrink: true } } };
  const noProfiles = donorId && !profilesQuery.isPending && (profilesQuery.data || []).length === 0;
  const hasGrantCode = Boolean(grantCode);

  return (
    <Card component="form" onSubmit={submit} noValidate>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {submitError && !submitError.fieldErrors ? (
            <Alert severity="error">{submitError.message}</Alert>
          ) : null}

          <section>
            <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
              Agreement
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <RhfTextField
                  name="grantCode"
                  control={control}
                  label="Grant code"
                  disabled
                  placeholder="ZRY/GA/YYYY/NNN"
                  slotProps={{ inputLabel: { shrink: true } }}
                  helperText={
                    hasGrantCode ? 'Grant code cannot be changed' : 'Auto-generated on save (ZRY/GA/YYYY/NNN)'
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
                <RhfTextField name="agreementName" control={control} label="Agreement name" required />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RhfSelect name="donorId" control={control} label="Donor" required options={donorOptions} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RhfSelect
                  name="fundProfileId"
                  control={control}
                  label="Fund profile"
                  required
                  options={profileOptions}
                  disabled={!donorId || profilesQuery.isPending}
                  helperText={
                    !donorId
                      ? 'Select a donor first'
                      : noProfiles
                        ? 'This donor has no fund profiles — add one on the donor page'
                        : 'Donor and class are inherited from the profile'
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RhfSelect
                  name="programmeId"
                  control={control}
                  label="Programme"
                  options={programmeOptions}
                  disabled={programmesQuery.isPending}
                  helperText="Leave as inherited to use the fund profile's programme"
                />
              </Grid>
            </Grid>
          </section>

          <section>
            <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
              Dates & value
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <RhfTextField name="agreementDate" control={control} label="Agreement date" required {...dateProps} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <RhfTextField name="startDate" control={control} label="Start date" required {...dateProps} />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <RhfTextField name="endDate" control={control} label="End date" required {...dateProps} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RhfTextField
                  name="totalGrantAmount"
                  control={control}
                  label="Total grant amount"
                  required
                  type="number"
                  slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <RhfSelect name="grantCurrency" control={control} label="Currency" required options={CURRENCY_OPTIONS} />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <RhfTextField
                  name="fxLockedRate"
                  control={control}
                  label="FX rate → INR"
                  required
                  type="number"
                  disabled={isInr}
                  helperText={isInr ? 'Locked to 1 for INR grants' : 'Rate at signing (locked)'}
                  slotProps={{ htmlInput: { min: 0, step: '0.0001' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Reporting amount (INR)"
                  value={reportingAmountInr}
                  disabled
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  helperText="Computed = Total grant amount × FX rate"
                />
              </Grid>
            </Grid>
          </section>

          <section>
            <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
              Notes
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <RhfTextField name="description" control={control} label="Description" multiline minRows={3} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <RhfTextField
                  name="agreementDocumentPath"
                  control={control}
                  label="Agreement document path"
                  helperText="Reference path/URL of the signed agreement"
                />
              </Grid>
            </Grid>
          </section>

          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button color="inherit" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Saving…' : submitLabel}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
