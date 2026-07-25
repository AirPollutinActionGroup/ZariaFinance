import { Alert, Button, Card, CardContent, Grid, Stack, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RhfSelect, RhfTextField } from '../../../shared/components/index.js';
import { applyServerErrors } from '../../../lib/forms/applyServerErrors.js';
import { donorSchema, donorFormDefaults } from '../validation/donorSchema.js';
import { DONOR_TYPE, FUND_SOURCE_DOMICILE, toOptions } from '../constants.js';
import { donorService } from '../services/donorService.js';
import { useState, useEffect } from 'react';
import { geographyService } from '../services/geographyService.js';

/**
 * Create/edit form for a donor. Purely presentational + validation:
 * persistence is delegated to the onSubmit prop (a mutation from the page).
 *
 * mode: 'create' | 'edit' — donorCode is immutable after creation because
 * UpdateDonorRequest does not carry it.
 */
export function DonorForm({ mode, defaultValues, onSubmit, submitting, submitError, onCancel }) {
  const { control, handleSubmit, setError, watch, setValue } = useForm({
    resolver: zodResolver(donorSchema),
    defaultValues: defaultValues || donorFormDefaults,
  });

  const fundSourceDomicile = watch('fundSourceDomicile');
  const countryId = watch('countryId');
  const stateId = watch('stateId');
  const [prevCountryId, setPrevCountryId] = useState(defaultValues?.countryId || '');
  const [prevStateId, setPrevStateId] = useState(defaultValues?.stateId || '');
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    geographyService.listCountries()
      .then(setCountries)
      .catch((err) => console.error('Error loading countries', err));
  }, []);

  useEffect(() => {
    geographyService.listStates(countryId || undefined)
      .then((data) => {
        setStates(data);
        if (countryId !== prevCountryId) {
          setValue('stateId', '');
          setPrevCountryId(countryId);
        }
      })
      .catch((err) => console.error('Error loading states', err));
  }, [countryId, prevCountryId, setValue]);

  useEffect(() => {
    if (stateId) {
      geographyService.listCities(stateId)
        .then((data) => {
          setCities(data);
          if (stateId !== prevStateId) {
            setValue('cityId', '');
            setPrevStateId(stateId);
          }
        })
        .catch((err) => console.error('Error loading cities', err));
    } else {
      setCities([]);
      if (stateId !== prevStateId) {
        setValue('cityId', '');
        setPrevStateId('');
      }
    }
  }, [stateId, prevStateId, setValue]);

  const isForeign = fundSourceDomicile === 'FOREIGN';
  const foreignCountryOptions = countries.map((c) => ({ value: c.label, label: c.label }));

  useEffect(() => {
    setValue('fcraApplicable', isForeign);
    if (!isForeign) {
      setValue('registrationNumber', '');
    }
  }, [isForeign, setValue]);

  const submit = handleSubmit(async (values) => {
    try {
      if (typeof onSubmit === 'function') {
        await onSubmit(values);
      } else if (mode === 'edit') {
        await donorService.updateDonor(defaultValues?.id, values);
      } else {
        await donorService.createDonor(values);
      }
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
              <Grid size={{ xs: 12, sm: 4 }}>
                <RhfSelect
                  name="donorType"
                  control={control}
                  label="Donor type"
                  required
                  options={toOptions(DONOR_TYPE)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <RhfSelect
                  name="fundSourceDomicile"
                  control={control}
                  label="Fund source domicile"
                  required
                  options={toOptions(FUND_SOURCE_DOMICILE)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="FCRA applicable"
                  value={isForeign ? 'Yes' : 'No'}
                  disabled
                  fullWidth
                  helperText="Derived from fund source domicile"
                />
              </Grid>
            </Grid>
          </section>

          {isForeign ? (
            <section>
              <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
                Foreign fund source
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <RhfTextField
                    name="foreignFundSourceType"
                    control={control}
                    label="Foreign fund source type"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <RhfSelect
                    name="foreignCountryId"
                    control={control}
                    label="Foreign country"
                    options={foreignCountryOptions}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <RhfTextField
                    name="foreignTaxIdentifier"
                    control={control}
                    label="Foreign tax identifier"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <RhfTextField
                    name="registrationNumber"
                    control={control}
                    label="Registration/Incorporation Number"
                  />
                </Grid>
              </Grid>
            </section>
          ) : null}

          <section>
            <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
              Contact
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
                <RhfTextField name="panCardNumber" control={control} label="PAN card number" />
              </Grid>
            </Grid>
          </section>

          <section>
            <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
              Point Of Contact
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <RhfTextField
                  name="spocNameOfThePerson"
                  control={control}
                  label="POC name"
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <RhfTextField
                  name="spocPhoneNumber"
                  control={control}
                  label="POC phone number"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <RhfTextField
                  name="spocEmail"
                  control={control}
                  label="POC email"
                  type="email"
                  required
                />
              </Grid>
            </Grid>
          </section>

          <section>
            <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
              Address
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RhfTextField name="address" control={control} label="Street address" required />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RhfTextField name="address2" control={control} label="Street address 2" />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <RhfSelect
                  name="countryId"
                  control={control}
                  label="Country"
                  options={countries}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <RhfSelect
                  name="stateId"
                  control={control}
                  label="State"
                  options={states}
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <RhfSelect
                  name="cityId"
                  control={control}
                  label="City"
                  options={cities}
                  disabled={!stateId}
                />
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
