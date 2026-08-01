import { useEffect, useRef } from 'react';
import { Alert, Button, Card, CardContent, Grid, Stack, TextField, Typography } from '@mui/material';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RhfAutocomplete, RhfSelect, RhfTextField } from '../../../shared/components/index.js';
import { applyServerErrors } from '../../../lib/forms/applyServerErrors.js';
import { formatInrExact } from '../../../lib/format/currency.js';
import { grantSchema, grantFormDefaults } from '../validation/grantSchema.js';
import { useFundProfilesByDonor } from '../hooks/useFundProfiles.js';
import { useProgrammes } from '../hooks/useProgrammes.js';
import { useFxRate } from '../hooks/useFxRate.js';
import { useUsers, userDisplayName } from '../hooks/useUsers.js';

const CURRENCY_OPTIONS = ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'CHF', 'JPY', 'SGD'].map((c) => ({
  value: c,
  label: c,
}));

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

// Mirrors GrantAgreement.isApproved (1 = approved, 2 = pending, 3 = on hold,
// 4 = completed) — the same states the PATCH lifecycle endpoints move between.
const APPROVAL_STATUS_OPTIONS = [
  { value: '2', label: 'Pending' },
  { value: '1', label: 'Approved' },
  { value: '3', label: 'On hold' },
  { value: '4', label: 'Completed' },
];

/**
 * Grant agreement form — the three sections of the New Grant Agreement Form.
 *
 * Section 1 (Agreement): the grant code is auto-generated server-side
 * (ZRY/GA/YYYY/NNN) and read-only. A grant inherits its donor and class from a
 * fund profile, so pick a donor to scope the profile list, then pick a profile.
 *
 * Section 2 (Dates & value): the total is read-only, inherited as the sum of the
 * selected profile's tranche plan; the FX rate auto-fills from the reference rate
 * for the agreement date and stays editable (forced to 1 and locked for INR);
 * the INR reporting amount is total × FX.
 *
 * Section 3 (Approval): approval state, approver, date and remarks. Independent
 * of the section 1 status — a grant can be active while approval is pending.
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
  const fundProfileId = useWatch({ control, name: 'fundProfileId' });
  const grantCurrency = useWatch({ control, name: 'grantCurrency' });
  const agreementDate = useWatch({ control, name: 'agreementDate' });
  const fxLockedRate = useWatch({ control, name: 'fxLockedRate' });
  const approvalStatus = useWatch({ control, name: 'approvalStatus' });

  const profilesQuery = useFundProfilesByDonor(donorId ? Number(donorId) : null);
  const programmesQuery = useProgrammes();
  const usersQuery = useUsers();
  const isInr = (grantCurrency || 'INR') === 'INR';
  const fxQuery = useFxRate(grantCurrency, agreementDate);

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
  useEffect(() => {
    if (isInr) setValue('fxLockedRate', '1');
  }, [isInr, setValue]);

  // Auto-fill the reference rate once per currency/date pair, so a manual
  // override survives re-renders and is only replaced when the pair changes.
  const appliedFxKey = useRef(null);
  const fxRate = fxQuery.data?.rateToInr;
  useEffect(() => {
    if (isInr || fxRate == null) return;
    const key = `${grantCurrency}|${agreementDate}`;
    if (appliedFxKey.current === key) return;
    appliedFxKey.current = key;
    setValue('fxLockedRate', String(fxRate));
  }, [isInr, fxRate, grantCurrency, agreementDate, setValue]);

  const donorOptions = donors.map((donor) => ({
    value: String(donor.id),
    label: `${donor.donorName} (${donor.donorCode})`,
  }));

  const profiles = profilesQuery.data || [];
  const profileOptions = profiles.map((p) => ({
    value: String(p.id),
    label: `${p.fundClassCode ? `Class ${p.fundClassCode}` : 'Unclassed'} · ${p.fundModeLabel} · ${
      p.programmeName || 'Untied'
    }${p.purpose ? ` — ${p.purpose}` : ''}`,
  }));

  // In edit mode the prefilled profile id arrives before its option list does;
  // carry a placeholder so the select isn't briefly holding an unknown value.
  if (fundProfileId && !profileOptions.some((o) => o.value === String(fundProfileId))) {
    profileOptions.unshift({ value: String(fundProfileId), label: 'Loading fund profile…' });
  }

  const programmeOptions = (programmesQuery.data || []).map((p) => ({
    value: String(p.id),
    label: `${p.programmeCode} · ${p.programmeName}`,
  }));

  const userOptions = (usersQuery.data || []).map((user) => ({
    value: String(user.id),
    label: userDisplayName(user),
  }));

  // Total is inherited from the profile's tranche plan, never entered here.
  const selectedDonor = donors.find((d) => String(d.id) === String(donorId));
  const bookValue = selectedDonor
    ? (selectedDonor.fundSourceDomicile === 'FOREIGN' ? 'FC · Foreign contribution' : 'LC · Local contribution')
    : '—';

  const selectedProfile = profiles.find((p) => String(p.id) === String(fundProfileId));
  const totalGrantAmount = selectedProfile?.plannedTotalAmount ?? null;
  const reportingAmountInr =
    Number(totalGrantAmount) > 0 && Number(fxLockedRate) > 0
      ? formatInrExact(Number(totalGrantAmount) * Number(fxLockedRate))
      : '—';

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      applyServerErrors(error, setError);
    }
  });

  const dateProps = { type: 'date', slotProps: { inputLabel: { shrink: true } } };
  const noProfiles = donorId && !profilesQuery.isPending && profiles.length === 0;
  const hasGrantCode = Boolean(grantCode);
  const isApproved = approvalStatus === '1';

  const fxHelperText = () => {
    if (isInr) return 'Locked to 1 for INR grants';
    if (fxQuery.isPending && agreementDate) return 'Fetching the reference rate…';
    const data = fxQuery.data;
    if (data?.rateToInr == null) return 'No reference rate found — enter the rate at signing';
    if (data.stale) return `No rate for ${data.requestedDate}; showing ${data.source} rate of ${data.rateDate}`;
    return `${data.source} rate for ${data.rateDate} — editable, locked at signing`;
  };

  const totalHelperText = () => {
    if (!fundProfileId) return 'Select a fund profile — the total is inherited from its tranche plan';
    if (Number(totalGrantAmount) > 0) return 'Inherited = Σ tranche amounts of the fund profile';
    return 'This fund profile has no tranche plan — add tranches on the profile to set the total';
  };

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
                <RhfAutocomplete
                  name="donorId"
                  control={control}
                  label="Donor"
                  required
                  options={donorOptions}
                  placeholder="Search donors…"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Book"
                  value={bookValue}
                  disabled
                  fullWidth
                  helperText="Derived from donor fund source domicile"
                />
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
                        : 'Donor, class and total are inherited from the profile'
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RhfAutocomplete
                  name="programmeId"
                  control={control}
                  label="Programme"
                  required
                  options={programmeOptions}
                  disabled={programmesQuery.isPending}
                  placeholder="Search programme codes…"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RhfSelect name="status" control={control} label="Status" required options={STATUS_OPTIONS} />
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
                  helperText={fxHelperText()}
                  slotProps={{ htmlInput: { min: 0, step: '0.0001' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  label="Total grant amount"
                  value={totalGrantAmount != null ? formatInrExact(totalGrantAmount) : '—'}
                  disabled
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  helperText={totalHelperText()}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
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
              Approval
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <RhfSelect
                  name="approvalStatus"
                  control={control}
                  label="Status"
                  required
                  options={APPROVAL_STATUS_OPTIONS}
                  helperText="Approval workflow — independent of the agreement status above"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <RhfAutocomplete
                  name="approvedBy"
                  control={control}
                  label="Approved by"
                  required={isApproved}
                  options={userOptions}
                  disabled={usersQuery.isPending}
                  placeholder="Search users…"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <RhfTextField
                  name="approvalDate"
                  control={control}
                  label="Approval date"
                  required={isApproved}
                  {...dateProps}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <RhfTextField
                  name="approvalRemarks"
                  control={control}
                  label="Remarks (optional)"
                  multiline
                  minRows={2}
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
