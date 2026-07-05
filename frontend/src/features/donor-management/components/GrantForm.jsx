import { Alert, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RhfSelect, RhfTextField } from '../../../shared/components/index.js';
import { applyServerErrors } from '../../../lib/forms/applyServerErrors.js';
import { grantSchema, grantFormDefaults } from '../validation/grantSchema.js';
import { FUND_CLASS, toOptions } from '../constants.js';

/**
 * Grant agreement creation form.
 *
 * Donors are selected from the live donor register. Programme has to be a
 * raw ID because the backend exposes no programme listing endpoint yet
 * (docs/BACKEND_GAPS.md #4) — the field is validated as numeric and the
 * server remains the authority on whether the programme exists.
 */
export function GrantForm({ donors, programmes, defaultValues, onSubmit, submitting, submitError, onCancel }) {
  const { control, handleSubmit, setError } = useForm({
    resolver: zodResolver(grantSchema),
    defaultValues: defaultValues || grantFormDefaults,
  });

  const donorOptions = donors.map((donor) => ({
    value: String(donor.id),
    label: `${donor.donorName} (${donor.donorCode})`,
  }));

  const programmeOptions = (programmes || []).map((programme) => ({
    value: String(programme.id),
    label: `${programme.programmeName} (${programme.programmeCode})`,
  }));

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      applyServerErrors(error, setError);
    }
  });

  const dateProps = { type: 'date', slotProps: { inputLabel: { shrink: true } } };

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
                <RhfTextField
                  name="agreementName"
                  control={control}
                  label="Agreement name"
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RhfSelect
                  name="donorId"
                  control={control}
                  label="Donor"
                  required
                  options={donorOptions}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RhfSelect
                  name="programmeId"
                  control={control}
                  label="Programme"
                  required
                  options={programmeOptions}
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
                <RhfTextField
                  name="agreementDate"
                  control={control}
                  label="Agreement date"
                  required
                  {...dateProps}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <RhfTextField
                  name="startDate"
                  control={control}
                  label="Start date"
                  required
                  {...dateProps}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <RhfTextField
                  name="endDate"
                  control={control}
                  label="End date"
                  required
                  {...dateProps}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RhfTextField
                  name="totalGrantAmount"
                  control={control}
                  label="Total grant amount (₹)"
                  required
                  type="number"
                  slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RhfSelect
                  name="fundClass"
                  control={control}
                  label="Fund class"
                  required
                  options={toOptions(FUND_CLASS)}
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
                  label="Description"
                  multiline
                  minRows={3}
                />
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
