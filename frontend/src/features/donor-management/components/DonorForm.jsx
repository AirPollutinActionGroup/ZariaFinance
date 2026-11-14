import { GeographyFields } from './GeographyFields.jsx';
import { Alert, Button, Card, CardContent, Grid, Stack, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RhfSelect, RhfTextField } from '../../../shared/components/index.js';
import { applyServerErrors } from '../../../lib/forms/applyServerErrors.js';
import { donorSchema, donorFormDefaults } from '../validation/donorSchema.js';
import { FUND_SOURCE_DOMICILE, toOptions } from '../constants.js';
import { documentTypeAppliesTo, documentTypeService } from '../../masters/services/documentTypeService.js';
import { donorService } from '../services/donorService.js';
import { useState, useEffect } from 'react';
import { geographyService } from '../services/geographyService.js';
import { donorTypeService } from '../services/donorTypeService.js';

/*
 * ID types come from the Document Type master (codes such as PAN_CARD). The
 * six built-in codes keep their tailored label / hint / length; any type added
 * in Master Configuration gets a generic "<name> number" field.
 */
const ID_FIELD = {
  PAN_CARD: { label: 'PAN Card Number', placeholder: 'e.g. ABCDE1234F (10 chars)', maxLength: 10, upper: true },
  AADHAAR_CARD: { label: 'Aadhaar Number', placeholder: '12-digit Aadhaar number', maxLength: 12, digits: true },
  VOTER_ID: { label: 'Voter ID Number', placeholder: 'e.g. ABC1234567', upper: true },
  DRIVING_LICENSE: { label: 'Driving License Number', placeholder: 'e.g. DL-1420110012345', upper: true },
  PASSPORT_ID: { label: 'Passport ID', placeholder: 'e.g. A12345678 (9 chars)', maxLength: 9, upper: true },
  FOREIGN_TAX_ID: { label: 'Foreign Tax Identifier', placeholder: 'e.g. SSN / Tax ID', maxLength: 15 },
};

function idField(idType, typeName) {
  if (ID_FIELD[idType]) return ID_FIELD[idType];
  // "GST Number" stays "GST Number"; "CIN Certificate" becomes "CIN Certificate number".
  const label = !typeName
    ? 'ID number'
    : /\b(number|no\.?|id)$/i.test(typeName.trim())
      ? typeName.trim()
      : `${typeName.trim()} number`;
  return { label, placeholder: label, upper: true };
}

function idSlotProps(field) {
  return {
    htmlInput: {
      ...(field.maxLength ? { maxLength: field.maxLength } : {}),
      ...(field.upper ? { style: { textTransform: 'uppercase' } } : {}),
    },
  };
}

/** Aadhaar keeps digits only; other numbers keep letters and digits, upper-cased. */
const formatIdNumber = (field, value) =>
  field.digits ? value.replace(/\D/g, '') : value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();

export function DonorForm({ mode, defaultValues, onSubmit, submitting, submitError, onCancel }) {
  const { control, handleSubmit, setError, watch, setValue } = useForm({
    resolver: zodResolver(donorSchema),
    defaultValues: defaultValues || donorFormDefaults,
  });

  const donorTypeId = watch('donorType');
  const idType = watch('idType');
  const fundSourceDomicile = watch('fundSourceDomicile');
  const [foreignCountries, setForeignCountries] = useState([]);
  const [donorTypes, setDonorTypes] = useState([]);

  // New donor: fill in the next free donor code (DNR-CD-nnn); the user can still change it.
  useEffect(() => {
    if (mode === 'edit') return;
    donorService
      .nextDonorCode()
      .then((code) => {
        if (code) setValue('donorCode', code, { shouldValidate: true });
      })
      .catch((err) => console.error('Error loading next donor code', err));
  }, [mode, setValue]);

  // Donor types are a manageable master (see Master Configuration) — load the
  // active ones for the dropdown instead of a hardcoded list.
  useEffect(() => {
    donorTypeService
      .listActiveDonorTypes()
      .then(setDonorTypes)
      .catch((err) => console.error('Error loading donor types', err));
  }, []);

  // ID types are the Document Type master (Master Configuration → Document Type):
  // active ones are offered; an edited donor also keeps the type it already has.
  const [documentTypes, setDocumentTypes] = useState([]);
  useEffect(() => {
    documentTypeService
      .listActiveDocumentTypes()
      .then(setDocumentTypes)
      .catch((err) => console.error('Error loading document types', err));
  }, []);
  const savedIdType = defaultValues?.idType || '';
  // An edited donor may keep its saved type as long as its domicile is unchanged.
  const keepsSavedType = (code) =>
    code === savedIdType && fundSourceDomicile === defaultValues?.fundSourceDomicile;
  const idTypeOptions = (excludePassport) => {
    // Only types meant for this donor's fund source domicile (Master → Document Type).
    const list = documentTypes.filter(
      (t) => (!excludePassport || t.code !== 'PASSPORT_ID') && documentTypeAppliesTo(t, fundSourceDomicile),
    );
    const options = list.map((t) => ({ value: t.code, label: t.name }));
    if (savedIdType && keepsSavedType(savedIdType) && !options.some((o) => o.value === savedIdType)) {
      options.push({ value: savedIdType, label: `${savedIdType} (inactive)` });
    }
    return [{ value: '', label: 'Select your preference' }, ...options];
  };
  // Switching domicile (e.g. Domestic → Foreign) clears an ID type that no longer fits.
  useEffect(() => {
    if (!idType || keepsSavedType(idType)) return;
    const type = documentTypes.find((t) => t.code === idType);
    if (type && !documentTypeAppliesTo(type, fundSourceDomicile)) {
      setValue('idType', '');
      setValue('idNumber', '');
    }
    // keepsSavedType only reads idType/fundSourceDomicile/defaultValues, covered below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fundSourceDomicile, documentTypes, idType, setValue]);

  const idTypeName = documentTypes.find((t) => t.code === idType)?.name;
  const currentIdField = idField(idType, idTypeName);
  const onIdNumberChange = (e) => {
    const formatted = formatIdNumber(currentIdField, e.target.value);
    setValue('idNumber', formatted, { shouldValidate: true });
    if (idType === 'PAN_CARD') setValue('panCardNumber', formatted);
    if (idType === 'PASSPORT_ID') setValue('passportNumber', formatted);
  };

  const selectedDonorType = donorTypes.find((dt) => String(dt.id) === String(donorTypeId));
  const donorTypeOptions = donorTypes.map((dt) => ({ value: dt.id, label: dt.name }));
  const isIndividual = (selectedDonorType?.name || '').toUpperCase() === 'INDIVIDUAL';
  const isForeign = fundSourceDomicile === 'FOREIGN';

  // Fund Source Domicile is constrained by the selected donor type's allowed
  // values (see Master Configuration → Donor Type); no restriction means both.
  const allowedDomiciles = selectedDonorType?.allowedFundSourceDomiciles?.length
    ? selectedDonorType.allowedFundSourceDomiciles
    : ['DOMESTIC', 'FOREIGN'];
  const fundSourceDomicileOptions = toOptions(FUND_SOURCE_DOMICILE).filter((opt) =>
    allowedDomiciles.includes(opt.value));
  const isDomicileLocked = allowedDomiciles.length === 1;

  // When the donor type only allows one Fund Source Domicile, lock the field to it.
  useEffect(() => {
    if (isDomicileLocked) {
      setValue('fundSourceDomicile', allowedDomiciles[0]);
    }
  }, [isDomicileLocked, allowedDomiciles.join(','), setValue]);

  // Mirror the selected donor type's name into a hidden field — donorSchema's
  // Individual + foreign passport check needs the name, not the submitted id.
  useEffect(() => {
    setValue('donorTypeName', selectedDonorType?.name || '');
  }, [selectedDonorType?.name, setValue]);

  useEffect(() => {
    if (isForeign) {
      geographyService
        .listCountries()
        .then((list) =>
          setForeignCountries(
            list
              .filter((c) => c.label.trim().toUpperCase() !== 'INDIA')
              .map((c) => ({ value: c.label, label: c.label }))
          )
        )
        .catch((err) => console.error('Error loading foreign countries', err));
    }
  }, [isForeign]);

  useEffect(() => {
    setValue('fcraApplicable', isForeign);
    setValue('book', isForeign ? 'FC' : 'LC');
    if (!isForeign) {
      setValue('registrationNumber', '');
      setValue('foreignCountryId', '');
      setValue('foreignFundSourceType', '');
      setForeignCountries([]);
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
                  helperText={mode === 'edit' ? 'Code cannot change after creation' : 'Auto-filled with the next free code'}
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
                  options={donorTypeOptions}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <RhfSelect
                  name="fundSourceDomicile"
                  control={control}
                  label="Fund source domicile"
                  required
                  disabled={isDomicileLocked}
                  helperText={
                    isDomicileLocked && selectedDonorType
                      ? `${selectedDonorType.name} is always ${allowedDomiciles[0] === 'FOREIGN' ? 'foreign' : 'domestic'}`
                      : ' '
                  }
                  options={fundSourceDomicileOptions}
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
                      required
                      options={idTypeOptions(false)}
                      helperText="Manage the list in Master → Document Type"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <RhfTextField
                      name="idNumber"
                      control={control}
                      label={currentIdField.label}
                      required
                      placeholder={currentIdField.placeholder}
                      slotProps={idSlotProps(currentIdField)}
                      onChange={onIdNumberChange}
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
                {isIndividual ? (
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
                ) : null}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <RhfSelect
                    name="idType"
                    control={control}
                    label="ID type"
                    options={idTypeOptions(true)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <RhfTextField
                    name="idNumber"
                    control={control}
                    label={currentIdField.label}
                    placeholder={currentIdField.placeholder}
                    slotProps={idSlotProps(currentIdField)}
                    onChange={onIdNumberChange}
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
              {/* Domestic locks Country to India (disabled); Foreign re-enables it. */}
              <GeographyFields
                control={control}
                setValue={setValue}
                errors={submitError?.fieldErrors}
                isDomestic={!isForeign}
              />

              <Grid size={{ xs: 6, sm: 3 }}>
                <RhfTextField name="postalCode" control={control} label="PIN / Postal code" placeholder="PIN / Postal code" />
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
