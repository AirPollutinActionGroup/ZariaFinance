import { useEffect } from 'react';
import { Alert, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RhfSelect, RhfTextField } from '../../../shared/components/index.js';
import { applyServerErrors } from '../../../lib/forms/applyServerErrors.js';
import { grantSchema, grantFormDefaults } from '../validation/grantSchema.js';
import { useFundProfilesByDonor } from '../hooks/useFundProfiles.js';

const CURRENCY_OPTIONS = ['INR', 'USD', 'GBP', 'EUR'].map((c) => ({ value: c, label: c }));

/**
 * Grant agreement creation form.
 *
 * A grant inherits its donor, programme and class from a fund profile: pick a
 * donor to scope the profile list, then pick one of that donor's fund profiles.
 * Foreign grants carry a currency + locked FX rate; the server computes the INR
 * reporting amount.
 */
export function GrantForm({ donors, defaultValues, onSubmit, submitting, submitError, onCancel }) {
  const { control, handleSubmit, setValue, setError } = useForm({
    resolver: zodResolver(grantSchema),
    defaultValues: defaultValues || grantFormDefaults,
  });

  const donorId = useWatch({ control, name: 'donorId' });
  const profilesQuery = useFundProfilesByDonor(donorId ? Number(donorId) : null);

  // When the donor changes, clear a now-invalid fund-profile selection.
  useEffect(() => {
    setValue('fundProfileId', '');
  }, [donorId, setValue]);

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

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      applyServerErrors(error, setError);
    }
  });

  const dateProps = { type: 'date', slotProps: { inputLabel: { shrink: true } } };
  const noProfiles = donorId && !profilesQuery.isPending && (profilesQuery.data || []).length === 0;

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
                <RhfTextField name="grantCode" control={control} label="Grant code" required />
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
                        : 'Donor, programme and class are inherited from the profile'
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
                  helperText="1 for INR grants"
                  slotProps={{ htmlInput: { min: 0, step: '0.0001' } }}
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
              {submitting ? 'Saving…' : 'Create grant'}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
