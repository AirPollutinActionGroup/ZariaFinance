import { Alert, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RhfSelect, RhfTextField } from '../../../shared/components/index.js';
import { applyServerErrors } from '../../../lib/forms/applyServerErrors.js';
import { donorSchema, donorFormDefaults } from '../validation/donorSchema.js';
import { FUND_CLASS, toOptions } from '../constants.js';

/**
 * Create/edit form for a donor. Purely presentational + validation:
 * persistence is delegated to the onSubmit prop (a mutation from the page).
 *
 * mode: 'create' | 'edit' — donorCode is immutable after creation because
 * UpdateDonorRequest does not carry it.
 */
export function DonorForm({ mode, defaultValues, onSubmit, submitting, submitError, onCancel }) {
  const { control, handleSubmit, setError } = useForm({
    resolver: zodResolver(donorSchema),
    defaultValues: defaultValues || donorFormDefaults,
  });

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      applyServerErrors(error, setError);
    }
  });

  return (
    <Card component="form" onSubmit={submit} noValidate>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {submitError && !submitError.fieldErrors ? (
            <Alert severity="error">{submitError.message}</Alert>
          ) : null}

          <section>
            <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
              Identity
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <RhfTextField
                  name="donorCode"
                  control={control}
                  label="Donor code"
                  required
                  disabled={mode === 'edit'}
                  helperText={mode === 'edit' ? 'Code cannot change after creation' : ' '}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
                <RhfTextField name="donorName" control={control} label="Donor name" required />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RhfTextField
                  name="donorType"
                  control={control}
                  label="Donor type"
                  required
                  helperText="e.g. Foundation, CSR, Individual"
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
              Contact & compliance
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RhfTextField name="email" control={control} label="Email" type="email" required />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RhfTextField name="phoneNumber" control={control} label="Phone number" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RhfTextField name="website" control={control} label="Website" />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RhfTextField
                  name="registrationNumber"
                  control={control}
                  label="Registration number"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RhfTextField name="taxId" control={control} label="Tax ID" />
              </Grid>
            </Grid>
          </section>

          <section>
            <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
              Address
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <RhfTextField name="address" control={control} label="Street address" />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <RhfTextField
                  name="cityId"
                  control={control}
                  label="City ID"
                  helperText="Master lookup pending (gap #4)"
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <RhfTextField
                  name="stateId"
                  control={control}
                  label="State ID"
                  helperText="Master lookup pending (gap #4)"
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <RhfTextField name="country" control={control} label="Country" />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <RhfTextField name="postalCode" control={control} label="Postal code" />
              </Grid>
            </Grid>
          </section>

          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button color="inherit" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Create donor'}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
