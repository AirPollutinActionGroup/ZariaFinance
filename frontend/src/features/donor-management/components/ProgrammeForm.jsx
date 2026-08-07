import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Card, CardContent, FormControlLabel, Grid, Stack, Switch, Typography } from '@mui/material';
import { RhfTextField } from '../../../shared/components/index.js';
import { applyServerErrors } from '../../../lib/forms/applyServerErrors.js';
import { programmeSchema, programmeFormDefaults } from '../validation/programmeSchema.js';

export function ProgrammeForm({ defaultValues, onSubmit, submitting, submitError, onCancel }) {
  const { control, handleSubmit, setError } = useForm({
    resolver: zodResolver(programmeSchema),
    defaultValues: defaultValues || programmeFormDefaults,
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
              Programme details
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <RhfTextField
                  name="programmeName"
                  control={control}
                  label="Programme name"
                  required
                  helperText="Programme code is assigned automatically"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <RhfTextField
                  name="description"
                  control={control}
                  label="Description"
                  multiline
                  rows={3}
                  placeholder="What this programme covers"
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch checked={Boolean(field.value)} onChange={(e) => field.onChange(e.target.checked)} />}
                      label="Active"
                    />
                  )}
                />
              </Grid>
            </Grid>
          </section>

          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button color="inherit" onClick={onCancel} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Saving…' : 'Create programme'}
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
