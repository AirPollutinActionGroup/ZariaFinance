import { GeographyFields } from './GeographyFields.jsx';
import { Alert, Button, Card, CardContent, Grid, Stack, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RhfSelect, RhfTextField } from '../../../shared/components/index.js';
import { applyServerErrors } from '../../../lib/forms/applyServerErrors.js';
import { donorSchema, donorFormDefaults } from '../validation/donorSchema.js';
import { DONOR_TYPE, FUND_SOURCE_DOMICILE, INDIVIDUAL_ID_TYPE, toOptions } from '../constants.js';
import { donorService } from '../services/donorService.js';
import { useState, useEffect } from 'react';
import { geographyService } from '../services/geographyService.js';

function getIdNumberLabel(idType) {
  switch (idType) {
    case 'PAN': return 'PAN Card Number';
    case 'AADHAR': return 'Aadhaar Number';
    case 'VOTER_ID': return 'Voter ID Number';
    case 'DRIVING_LICENSE': return 'Driving License Number';
    case 'PASSPORT': return 'Passport ID';
    case 'FOREIGN_TAX_ID': return 'Foreign Tax Identifier';
    default: return 'ID number';
  }
}

function getIdNumberPlaceholder(idType) {
  switch (idType) {
    case 'PAN': return 'e.g. ABCDE1234F (10 chars)';
    case 'AADHAR': return '12-digit Aadhaar number';
    case 'VOTER_ID': return 'e.g. ABC1234567';
    case 'DRIVING_LICENSE': return 'e.g. DL-1420110012345';
    case 'PASSPORT': return 'e.g. A12345678 (9 chars)';
    case 'FOREIGN_TAX_ID': return 'e.g. SSN / Tax ID';
    default: return 'ID number';
  }
}

function getIdNumberSlotProps(idType) {
  if (idType === 'PAN') return { htmlInput: { maxLength: 10, style: { textTransform: 'uppercase' } } };
  if (idType === 'AADHAR') return { htmlInput: { maxLength: 12 } };
  if (idType === 'PASSPORT') return { htmlInput: { maxLength: 9, style: { textTransform: 'uppercase' } } };
  if (idType === 'FOREIGN_TAX_ID') return { htmlInput: { maxLength: 15 } };
  return { htmlInput: { style: { textTransform: 'uppercase' } } };
}

export function DonorForm({ mode, defaultValues, onSubmit, submitting, submitError, onCancel }) {
  const { control, handleSubmit, setError, watch, setValue } = useForm({
    resolver: zodResolver(donorSchema),
    defaultValues: defaultValues || donorFormDefaults,
  });

  const donorType = watch('donorType');
  const idType = watch('idType');
  const fundSourceDomicile = watch('fundSourceDomicile');
  const isIndividual = donorType === 'INDIVIDUAL';
  const isForeign = fundSourceDomicile === 'FOREIGN';
  const [foreignCountries, setForeignCountries] = useState([]);

  useEffect(() => {
    if (isForeign) {
      geographyService
        .listCountries()
        .then((list) => setForeignCountries(list.map((c) => ({ value: c.label, label: c.label }))))
        .catch((err) => console.error('Error loading foreign countries', err));
    }
  }, [isForeign]);

  useEffect(() => {
    setValue('fcraApplicable', isForeign);
    setValue('book', isForeign ? 'FC' : 'LC');
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
              <Grid size={{ xs: 12, sm: 3 }}>
                <RhfSelect
                  name="donorType"
                  control={control}
                  label="Donor type"
                  required
                  options={toOptions(DONOR_TYPE)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <RhfSelect
                  name="fundSourceDomicile"
                  control={control}
                  label="Fund source domicile"
                  required
                  options={toOptions(FUND_SOURCE_DOMICILE)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  label="Book"
                  value={isForeign ? 'FC · Foreign contribution' : 'LC · Local contribution'}
                  disabled
                  fullWidth
                  helperText="Derived from fund source domicile"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  label="FCRA applicable"
                  value={isForeign ? 'Yes' : 'No'}
                  disabled
                  fullWidth
                  helperText="Derived from fund source domicile"
                />
              </Grid>

              {!isForeign ? (
                <>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <RhfSelect
                      name="idType"
                      control={control}
                      label="ID type"
                      options={[
                        { value: '', label: 'Select your preference' },
                        ...toOptions(INDIVIDUAL_ID_TYPE),
                      ]}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <RhfTextField
                      name="idNumber"
                      control={control}
                      label={getIdNumberLabel(idType)}
                      placeholder={getIdNumberPlaceholder(idType)}
                      slotProps={getIdNumberSlotProps(idType)}
                      onChange={(e) => {
                        const val = e.target.value;
                        const formatted = idType === 'AADHAR'
                          ? val.replace(/\D/g, '')
                          : val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                        setValue('idNumber', formatted, { shouldValidate: true });
                        if (idType === 'PASSPORT') {
                          setValue('passportNumber', formatted);
                        }
                      }}
                    />
                  </Grid>
                </>
              ) : null}
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
                    options={foreignCountries}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <RhfTextField
                    name="registrationNumber"
                    control={control}
                    label="Registration/Incorporation Number"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <RhfTextField
                    name="passportNumber"
                    control={control}
                    label="Passport ID"
                    required
                    placeholder="e.g. A12345678"
                    slotProps={{ htmlInput: { maxLength: 9, style: { textTransform: 'uppercase' } } }}
                    onChange={(e) => {
                      const clean = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                      setValue('passportNumber', clean, { shouldValidate: true });
                    }}
                  />
                </Grid>

                {isIndividual ? (
                  <>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <RhfSelect
                        name="idType"
                        control={control}
                        label="ID type"
                        options={[
                          { value: '', label: 'Select your preference' },
                          ...toOptions(
                            Object.fromEntries(
                              Object.entries(INDIVIDUAL_ID_TYPE).filter(([key]) => key !== 'PASSPORT')
                            )
                          ),
                        ]}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <RhfTextField
                        name="idNumber"
                        control={control}
                        label={getIdNumberLabel(idType)}
                        placeholder={getIdNumberPlaceholder(idType)}
                        slotProps={getIdNumberSlotProps(idType)}
                        onChange={(e) => {
                          const val = e.target.value;
                          const formatted = idType === 'AADHAR'
                            ? val.replace(/\D/g, '')
                            : val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                          setValue('idNumber', formatted, { shouldValidate: true });
                          if (idType === 'PAN') {
                            setValue('panCardNumber', formatted);
                          }
                          if (idType === 'PASSPORT') {
                            setValue('passportNumber', formatted);
                          }
                        }}
                      />
                    </Grid>
                  </>
                ) : null}
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

          {/* ADDRESS SECTION */}
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

              {/* DYNAMIC GEOGRAPHY FIELDS */}
              <GeographyFields
                control={control}
                setValue={setValue}
                errors={submitError?.fieldErrors}
              />

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
