import { useEffect, useRef } from 'react';
import { Alert, Button, Card, CardContent, Grid, Stack, TextField, Typography } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RhfAutocomplete, RhfSelect, RhfTextField } from '../../../shared/components/index.js';
import { applyServerErrors } from '../../../lib/forms/applyServerErrors.js';
import { formatInrExact } from '../../../lib/format/currency.js';
import { grantSchema, grantFormDefaults } from '../validation/grantSchema.js';
import { useFundProfilesByDonor } from '../hooks/useFundProfiles.js';

/**
 * Grant agreement form — the three sections of the New Grant Agreement Form.
 *
 * Section 1 (Agreement): the grant code is auto-generated server-side
 * (ZRY/GA/YYYY/NNN) and read-only. A grant inherits its donor and class from a
 * fund profile, so pick a donor to scope the profile list, then pick a profile.
 *
 * Section 2 (Dates & value): the total is read-only, inherited as the sum of
 * the selected profile's tranche plan. Every grant reports in INR at par —
 * there is no multi-currency support.
 *
 * Section 3 (Notes): free-text remarks and the agreement document's file path,
 * both optional.
 *
 * Approval workflow (status, approver, date, remarks) is managed elsewhere.
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
  const agreementDocumentPath = useWatch({ control, name: 'agreementDocumentPath' });

  const profilesQuery = useFundProfilesByDonor(donorId ? Number(donorId) : null);

  // When the donor changes, clear a now-invalid fund-profile selection — but not
  // on the initial render, which would wipe a profile prefilled in edit mode.
  // Compares against the previous donorId (rather than a one-shot "have I run
  // yet" flag) so this stays correct under StrictMode's double-invoked effects
  // in dev, which would otherwise trip a one-shot flag on the harmless second
  // invocation and wipe the field right after load.
  const prevDonorIdRef = useRef(donorId);
  useEffect(() => {
    if (prevDonorIdRef.current !== donorId) {
      prevDonorIdRef.current = donorId;
      setValue('fundProfileId', '');
    }
  }, [donorId, setValue]);

  const donorOptions = donors.map((donor) => ({
    value: String(donor.id),
    label: `${donor.donorName} (${donor.donorCode})`,
  }));

  const profiles = profilesQuery.data || [];
  const profileOptions = profiles.map((p) => {
    // A profile already backing a different grant agreement can't be picked again —
    // except the one currently selected, so editing an existing grant still works.
    const assignedElsewhere = p.assignedGrantCode && String(p.id) !== String(fundProfileId);
    return {
      value: String(p.id),
      label: `${p.fundClassCode ? `Class ${p.fundClassCode}` : 'Unclassed'} · ${p.fundModeLabel} · ${
        p.programmeName || 'Untied'
      }${p.purpose ? ` — ${p.purpose}` : ''}${assignedElsewhere ? ` (used by ${p.assignedGrantCode})` : ''}`,
      disabled: assignedElsewhere,
    };
  });

  // In edit mode the prefilled profile id arrives before its option list does;
  // carry a placeholder so the select isn't briefly holding an unknown value.
  if (fundProfileId && !profileOptions.some((o) => o.value === String(fundProfileId))) {
    profileOptions.unshift({ value: String(fundProfileId), label: 'Loading fund profile…' });
  }

  // Total is inherited from the profile's tranche plan, never entered here.
  const selectedDonor = donors.find((d) => String(d.id) === String(donorId));
  const bookValue = selectedDonor
    ? (selectedDonor.fundSourceDomicile === 'FOREIGN' ? 'FC · Foreign contribution' : 'LC · Local contribution')
    : '—';

  const selectedProfile = profiles.find((p) => String(p.id) === String(fundProfileId));
  const totalGrantAmount = selectedProfile?.disbursementRules?.[0]?.totalAmount ?? null;

  const handleDocumentChange = (event) => {
    const file = event.target.files?.[0];
    if (file) setValue('agreementDocumentPath', file.name);
  };

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
              {hasGrantCode ? (
                <Grid size={{ xs: 12, sm: 4 }}>
                  <RhfTextField
                    name="grantCode"
                    control={control}
                    label="Grant code"
                    disabled
                    slotProps={{ inputLabel: { shrink: true } }}
                    helperText="Grant code cannot be changed"
                  />
                </Grid>
              ) : null}
              <Grid size={{ xs: 12, sm: hasGrantCode ? 8 : 12 }}>
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
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Total grant amount"
                  value={totalGrantAmount != null ? formatInrExact(totalGrantAmount) : '—'}
                  disabled
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                  helperText={totalHelperText()}
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
                <RhfTextField
                  name="description"
                  control={control}
                  label="Remarks (optional)"
                  multiline
                  minRows={2}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField
                    label="Agreement document (optional)"
                    value={agreementDocumentPath || ''}
                    disabled
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                    helperText="Choosing a file only records its name here — it is not uploaded"
                  />
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<UploadFileIcon />}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    Choose file
                    <input type="file" hidden onChange={handleDocumentChange} />
                  </Button>
                </Stack>
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
