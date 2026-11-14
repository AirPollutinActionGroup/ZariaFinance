import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  LinearProgress,
  Link,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { PageHeader, RhfTextField, RhfSelect } from '../../../shared/components/index.js';
import { geographyService } from '../../donor-management/services/geographyService.js';
import { usePaymentModes } from '../../payment-mode/hooks/usePaymentModes.js';
import { applyServerErrors } from '../../../lib/forms/applyServerErrors.js';
import { useCreateVendor } from '../hooks/useVendors.js';
import {
  ENTITY_TYPE_OPTIONS,
  GST_REGISTRATION_TYPE_OPTIONS,
  TDS_SECTION_OPTIONS,
  VENDOR_CATEGORY_OPTIONS,
  VENDOR_DOCUMENTS,
  ENTERPRISE_CLASSIFICATION_OPTIONS,
} from '../constants.js';
import {
  vendorCreateSchema,
  vendorCreateDefaults,
} from '../validation/vendorCreateSchema.js';
import {
  ChoiceCard,
  DocumentTile,
  FormSection,
  RhfYesNo,
} from '../components/VendorFormParts.jsx';

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

/** Which form fields live in which section — used for error and progress tracking. */
const SECTIONS = [
  { id: 'vendor-entity', title: 'Entity type', fields: ['entityType'] },
  {
    id: 'vendor-identification',
    title: 'Identification',
    fields: ['legalName', 'hasIncorporationCertificate', 'dateOfIncorporation', 'registrationNo', 'aadhaarNumber'],
  },
  {
    id: 'vendor-tax',
    title: 'Tax & statutory',
    fields: [
      'panNumber', 'hasGstRegistration', 'gstNumber', 'gstRegistrationType', 'tanNumber',
      'hasMsmeRegistration', 'udyamNumber', 'enterpriseClassification', 'tdsSection',
    ],
  },
  {
    id: 'vendor-banking',
    title: 'Banking',
    fields: ['accountNumber', 'ifscCode', 'accountHolderName', 'bankName', 'branchName', 'paymentMode'],
  },
  {
    id: 'vendor-contact',
    title: 'Contact & address',
    fields: ['contactName', 'phoneNumber', 'contactEmail', 'registeredAddress', 'state', 'pincode'],
  },
  { id: 'vendor-classification', title: 'Classification', fields: ['vendorCategory', 'relatedParty'] },
  { id: 'vendor-documents', title: 'Documents', fields: [] },
];

const filled = (v, min = 1) => typeof v === 'string' && v.trim().length >= min;

/** Mirrors the schema's required rules so the rail can show live progress. */
function sectionComplete(id, v) {
  const isIndividual = v.entityType === 'Individual';
  switch (id) {
    case 'vendor-entity':
      return Boolean(v.entityType);
    case 'vendor-identification': {
      if (!filled(v.legalName, 2)) return false;
      if (isIndividual) return /^\d{12}$/.test(v.aadhaarNumber || '');
      if ((v.entityType === 'LLP' || v.entityType === 'Pvt Ltd') && v.hasIncorporationCertificate === 'Yes') {
        return filled(v.dateOfIncorporation) && filled(v.registrationNo, 2);
      }
      return true;
    }
    case 'vendor-tax': {
      if (!PAN_REGEX.test(v.panNumber || '') || !v.tdsSection) return false;
      if (isIndividual) return true;
      if (v.hasGstRegistration === 'Yes' && (!GST_REGEX.test(v.gstNumber || '') || !v.gstRegistrationType)) return false;
      if (v.hasMsmeRegistration === 'Yes' && (!filled(v.udyamNumber, 2) || !v.enterpriseClassification)) return false;
      return true;
    }
    case 'vendor-banking':
      return filled(v.accountNumber, 4) && IFSC_REGEX.test(v.ifscCode || '')
        && filled(v.accountHolderName, 2) && filled(v.paymentMode);
    case 'vendor-contact':
      return filled(v.contactName, 2) && /^\d{10}$/.test(v.phoneNumber || '')
        && /\S+@\S+\.\S+/.test(v.contactEmail || '') && filled(v.registeredAddress, 5)
        && filled(v.state) && /^\d{6}$/.test(v.pincode || '');
    case 'vendor-classification':
      return Boolean(v.vendorCategory && v.relatedParty);
    default:
      return false;
  }
}

const scrollToSection = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export function VendorCreatePage() {
  const navigate = useNavigate();
  const [states, setStates] = useState([]);
  const [documents, setDocuments] = useState({});

  useEffect(() => {
    geographyService
      .listStates(1)
      .then((data) => {
        if (data && data.length > 0) {
          setStates(data.map((s) => ({ value: s.label, label: s.label })));
        }
      })
      .catch((err) => console.error('Error fetching states:', err));
  }, []);

  const createVendor = useCreateVendor();
  const paymentModesQuery = usePaymentModes();
  const paymentModeOptions = (paymentModesQuery.data || [])
    .filter((mode) => mode.status === 'ACTIVE')
    .map((mode) => ({ value: mode.name, label: mode.name }));

  const { control, handleSubmit, setValue, setError, getValues, trigger, formState } = useForm({
    resolver: zodResolver(vendorCreateSchema),
    defaultValues: vendorCreateDefaults,
  });
  const { errors, isSubmitted } = formState;

  const values = useWatch({ control });
  const { entityType, hasIncorporationCertificate, hasGstRegistration, hasMsmeRegistration, relatedParty } = values;
  const isIndividual = entityType === 'Individual';
  const vendorType = isIndividual ? 'Individual' : 'Organisation';
  const showIncorporationField = entityType === 'LLP' || entityType === 'Pvt Ltd';
  const showIncorporationDetails = showIncorporationField && hasIncorporationCertificate === 'Yes';
  const showGstDetails = !isIndividual && hasGstRegistration === 'Yes';
  const showMsmeDetails = !isIndividual && hasMsmeRegistration === 'Yes';

  const chooseVendorType = (next) => {
    if (next === 'Individual') {
      setValue('entityType', 'Individual', { shouldValidate: isSubmitted });
    } else if (isIndividual) {
      setValue('entityType', ENTITY_TYPE_OPTIONS[0].value, { shouldValidate: isSubmitted });
    }
  };

  // TDS section default follows entity type — 194J for Individuals, 194C otherwise.
  useEffect(() => {
    setValue('tdsSection', isIndividual ? '194J' : '194C');
  }, [isIndividual, setValue]);

  // Once the user has tried to save, re-check the whole form whenever a choice
  // shows or hides fields, so errors on fields that are now hidden go away.
  useEffect(() => {
    if (isSubmitted) trigger();
  }, [entityType, hasIncorporationCertificate, hasGstRegistration, hasMsmeRegistration, isSubmitted, trigger]);

  /** onChange that normalises input (upper-case codes, digits-only numbers). */
  const normalised = (name, transform) => (e) =>
    setValue(name, transform(e.target.value), { shouldDirty: true, shouldValidate: isSubmitted });
  const toCode = (v) => v.toUpperCase().replace(/\s/g, '');
  const toDigits = (max) => (v) => v.replace(/\D/g, '').slice(0, max);

  const applicableDocuments = VENDOR_DOCUMENTS.filter((doc) => {
    if (Array.isArray(doc.requiredFor)) return doc.requiredFor.includes(entityType);
    if (doc.requiredFor === 'all') return true;
    if (doc.requiredFor === 'individual') return isIndividual;
    return !isIndividual;
  });
  const uploadedCount = applicableDocuments.filter((d) => documents[d.key]).length;

  const sectionState = SECTIONS.map((s) => {
    let status = null;
    if (s.id === 'vendor-documents') {
      status = applicableDocuments.length > 0 && uploadedCount === applicableDocuments.length ? 'complete' : null;
    } else if (s.fields.some((f) => errors[f])) {
      status = 'error';
    } else if (sectionComplete(s.id, values)) {
      status = 'complete';
    }
    return { ...s, status };
  });
  const statusOf = (id) => sectionState.find((s) => s.id === id)?.status;
  const requiredSections = sectionState.filter((s) => s.id !== 'vendor-documents');
  const completeCount = requiredSections.filter((s) => s.status === 'complete').length;
  const errorCount = Object.keys(errors).length;

  const onSubmit = async (formValues) => {
    try {
      const created = await createVendor.mutateAsync(formValues);
      navigate(`/vendor-registration/${created.id}`);
    } catch (error) {
      applyServerErrors(error, setError);
    }
  };

  const onInvalid = (formErrors) => {
    const first = SECTIONS.find((s) => s.fields.some((f) => formErrors[f]));
    if (first) scrollToSection(first.id);
  };

  const saveButton = (
    <Button
      type="submit"
      form="vendor-create-form"
      variant="contained"
      startIcon={<SaveIcon />}
      disabled={createVendor.isPending}
      fullWidth
      size="large"
    >
      {createVendor.isPending ? 'Saving…' : 'Save vendor'}
    </Button>
  );

  const field = { xs: 12, sm: 6, md: 4 };

  return (
    <Box>
      <PageHeader
        eyebrow="Vendor registration"
        title="New vendor"
        subtitle="Add a supplier to the register. Fields change with the vendor type you choose."
        actions={
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/vendor-registration')}>
            Back to list
          </Button>
        }
      />

      <Grid container spacing={2.5} alignItems="flex-start">
        <Grid size={{ xs: 12, lg: 9 }}>
          <Stack
            component="form"
            id="vendor-create-form"
            spacing={2}
            onSubmit={handleSubmit(onSubmit, onInvalid)}
            noValidate
          >
            {isSubmitted && errorCount > 0 ? (
              <Alert severity="error" variant="outlined">
                {errorCount === 1 ? '1 field needs' : `${errorCount} fields need`} attention before the
                vendor can be saved. Sections with problems are marked below.
              </Alert>
            ) : null}

            <FormSection
              id="vendor-entity"
              number="01"
              title="Entity type"
              description="Decides which ID, tax and document fields apply below."
              status={statusOf('vendor-entity')}
            >
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ChoiceCard
                    icon={PersonOutlineIcon}
                    title="Individual"
                    description="A person, such as a freelancer or consultant. Identified by Aadhaar."
                    selected={vendorType === 'Individual'}
                    onClick={() => chooseVendorType('Individual')}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ChoiceCard
                    icon={ApartmentOutlinedIcon}
                    title="Organisation"
                    description="A registered business, trust or non-profit."
                    selected={vendorType === 'Organisation'}
                    onClick={() => chooseVendorType('Organisation')}
                  />
                </Grid>
              </Grid>
              {vendorType === 'Organisation' && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>
                    Organisation type *
                  </Typography>
                  <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={entityType}
                    onChange={(_e, next) => {
                      if (next) setValue('entityType', next, { shouldValidate: isSubmitted });
                    }}
                    aria-label="Organisation type"
                    sx={{ flexWrap: 'wrap', gap: 0.75, '& .MuiToggleButton-root': { border: '1px solid', borderColor: 'divider', borderRadius: '8px !important', px: 1.5, ml: '0 !important' } }}
                  >
                    {ENTITY_TYPE_OPTIONS.map((o) => (
                      <ToggleButton key={o.value} value={o.value}>
                        {o.label}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Box>
              )}
            </FormSection>

            <FormSection
              id="vendor-identification"
              number="02"
              title="Identification"
              description={
                isIndividual
                  ? 'Individuals are identified by Aadhaar instead of company registration.'
                  : showIncorporationField
                    ? 'Certificate details are asked for only if you have the Incorporation Certificate.'
                    : undefined
              }
              status={statusOf('vendor-identification')}
            >
              <Grid container columnSpacing={2} rowSpacing={1.25}>
                <Grid size={{ xs: 12, md: isIndividual ? 8 : 12 }}>
                  <RhfTextField
                    name="legalName"
                    control={control}
                    label={isIndividual ? 'Full name (as on PAN)' : 'Legal name'}
                    placeholder={isIndividual ? 'e.g. Priya Sharma' : 'e.g. Greenline Logistics Pvt Ltd'}
                    required
                  />
                </Grid>
                {isIndividual && (
                  <Grid size={{ xs: 12, md: 4 }}>
                    <RhfTextField
                      name="aadhaarNumber"
                      control={control}
                      label="Aadhaar number"
                      placeholder="12 digits"
                      required
                      helperText="For KYC only. Not shown on the ledger."
                      onChange={normalised('aadhaarNumber', toDigits(12))}
                      slotProps={{ htmlInput: { inputMode: 'numeric' } }}
                    />
                  </Grid>
                )}
                {showIncorporationField && (
                  <Grid size={field}>
                    <RhfYesNo
                      name="hasIncorporationCertificate"
                      control={control}
                      label="Incorporation cert.?"
                      required
                    />
                  </Grid>
                )}
                {showIncorporationDetails && (
                  <>
                    <Grid size={field}>
                      <RhfTextField
                        name="dateOfIncorporation"
                        control={control}
                        label="Date of incorporation"
                        type="date"
                        required
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                    </Grid>
                    <Grid size={field}>
                      <RhfTextField
                        name="registrationNo"
                        control={control}
                        label="CIN / registration no."
                        placeholder="e.g. U60200DL2015PTC281234"
                        required
                        onChange={normalised('registrationNo', toCode)}
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            </FormSection>

            <FormSection
              id="vendor-tax"
              number="03"
              title="Tax & statutory"
              description={isIndividual ? 'GST, TAN and MSME do not apply to individuals.' : undefined}
              status={statusOf('vendor-tax')}
            >
              <Grid container columnSpacing={2} rowSpacing={1.25}>
                <Grid size={field}>
                  <RhfTextField
                    name="panNumber"
                    control={control}
                    label="PAN"
                    placeholder="ABCDE1234F"
                    required
                    onChange={normalised('panNumber', (v) => toCode(v).slice(0, 10))}
                  />
                </Grid>
                <Grid size={field}>
                  <RhfSelect
                    name="tdsSection"
                    control={control}
                    label="TDS section"
                    required
                    options={TDS_SECTION_OPTIONS}
                    helperText={isIndividual ? 'Usually 194J for individuals.' : 'Usually 194C for organisations.'}
                  />
                </Grid>
                {!isIndividual && (
                  <Grid size={field}>
                    <RhfTextField
                      name="tanNumber"
                      control={control}
                      label="TAN"
                      placeholder="Optional"
                      helperText="Only if the vendor deducts TDS."
                      onChange={normalised('tanNumber', (v) => toCode(v).slice(0, 10))}
                    />
                  </Grid>
                )}
              </Grid>

              {!isIndividual && (
                <>
                  <Divider sx={{ my: 1.5 }} />
                  <Grid container columnSpacing={2} rowSpacing={1.25}>
                    <Grid size={field}>
                      <RhfYesNo name="hasGstRegistration" control={control} label="GST registered?" required />
                    </Grid>
                    {showGstDetails && (
                      <>
                        <Grid size={field}>
                          <RhfTextField
                            name="gstNumber"
                            control={control}
                            label="GSTIN"
                            placeholder="07AAACG1234H1ZC"
                            required
                            onChange={normalised('gstNumber', (v) => toCode(v).slice(0, 15))}
                          />
                        </Grid>
                        <Grid size={field}>
                          <RhfSelect
                            name="gstRegistrationType"
                            control={control}
                            label="GST registration type"
                            required
                            options={GST_REGISTRATION_TYPE_OPTIONS}
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                  <Grid container columnSpacing={2} rowSpacing={1.25}>
                    <Grid size={field}>
                      <RhfYesNo name="hasMsmeRegistration" control={control} label="MSME registered?" required />
                    </Grid>
                    {showMsmeDetails && (
                      <>
                        <Grid size={field}>
                          <RhfTextField
                            name="udyamNumber"
                            control={control}
                            label="Udyam / MSME number"
                            placeholder="UDYAM-XX-00-0000000"
                            required
                            helperText="MSME vendors must be paid within 45 days."
                            onChange={normalised('udyamNumber', (v) => v.toUpperCase())}
                          />
                        </Grid>
                        <Grid size={field}>
                          <RhfSelect
                            name="enterpriseClassification"
                            control={control}
                            label="Enterprise size"
                            required
                            options={ENTERPRISE_CLASSIFICATION_OPTIONS}
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                </>
              )}
            </FormSection>

            <FormSection
              id="vendor-banking"
              number="04"
              title="Banking"
              description="Payments to this vendor go to this account."
              status={statusOf('vendor-banking')}
            >
              <Grid container columnSpacing={2} rowSpacing={1.25}>
                <Grid size={field}>
                  <RhfTextField
                    name="accountHolderName"
                    control={control}
                    label="Account holder name"
                    required
                    helperText={
                      filled(values.legalName, 2) && values.accountHolderName !== values.legalName ? (
                        <>
                          Must match the PAN / legal name.{' '}
                          <Link
                            component="button"
                            type="button"
                            variant="caption"
                            onClick={() =>
                              setValue('accountHolderName', getValues('legalName'), { shouldValidate: isSubmitted })
                            }
                          >
                            Use legal name
                          </Link>
                        </>
                      ) : (
                        'Must match the PAN / legal name.'
                      )
                    }
                  />
                </Grid>
                <Grid size={field}>
                  <RhfTextField
                    name="accountNumber"
                    control={control}
                    label="Account number"
                    required
                    onChange={normalised('accountNumber', toDigits(18))}
                    slotProps={{ htmlInput: { inputMode: 'numeric' } }}
                  />
                </Grid>
                <Grid size={field}>
                  <RhfTextField
                    name="ifscCode"
                    control={control}
                    label="IFSC"
                    placeholder="HDFC0000123"
                    required
                    onChange={normalised('ifscCode', (v) => toCode(v).slice(0, 11))}
                  />
                </Grid>
                <Grid size={field}>
                  <RhfTextField name="bankName" control={control} label="Bank name" />
                </Grid>
                <Grid size={field}>
                  <RhfTextField name="branchName" control={control} label="Branch" />
                </Grid>
                <Grid size={field}>
                  <RhfSelect
                    name="paymentMode"
                    control={control}
                    label="Preferred payment mode"
                    required
                    disabled={paymentModesQuery.isLoading}
                    options={paymentModeOptions}
                    helperText={
                      paymentModesQuery.isLoading
                        ? 'Loading payment modes…'
                        : paymentModeOptions.length === 0
                          ? 'No active payment modes set up.'
                          : undefined
                    }
                  />
                </Grid>
              </Grid>
            </FormSection>

            <FormSection
              id="vendor-contact"
              number="05"
              title="Contact & address"
              description="The state sets the GST place of supply."
              status={statusOf('vendor-contact')}
            >
              <Grid container columnSpacing={2} rowSpacing={1.25}>
                <Grid size={field}>
                  <RhfTextField name="contactName" control={control} label="Contact person" required />
                </Grid>
                <Grid size={field}>
                  <RhfTextField
                    name="phoneNumber"
                    control={control}
                    label="Phone"
                    placeholder="10-digit mobile"
                    required
                    type="tel"
                    onChange={normalised('phoneNumber', toDigits(10))}
                  />
                </Grid>
                <Grid size={field}>
                  <RhfTextField name="contactEmail" control={control} label="Email" type="email" required />
                </Grid>
                <Grid size={12}>
                  <RhfTextField
                    name="registeredAddress"
                    control={control}
                    label="Registered address"
                    required
                    multiline
                    minRows={2}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <RhfSelect name="state" control={control} label="State" required options={states} />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <RhfTextField
                    name="pincode"
                    control={control}
                    label="Pincode"
                    required
                    onChange={normalised('pincode', toDigits(6))}
                    slotProps={{ htmlInput: { inputMode: 'numeric' } }}
                  />
                </Grid>
              </Grid>
            </FormSection>

            <FormSection
              id="vendor-classification"
              number="06"
              title="Classification"
              status={statusOf('vendor-classification')}
            >
              <Grid container columnSpacing={2} rowSpacing={1.25}>
                <Grid size={field}>
                  <RhfSelect
                    name="vendorCategory"
                    control={control}
                    label="Vendor category"
                    required
                    options={VENDOR_CATEGORY_OPTIONS}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 5 }}>
                  <RhfYesNo
                    name="relatedParty"
                    control={control}
                    label="Related party?"
                    required
                    helperText="Is the vendor linked to a director or board member?"
                  />
                </Grid>
                {relatedParty === 'Yes' && (
                  <Grid size={12}>
                    <Alert severity="warning" variant="outlined">
                      This vendor will be marked as a related party and sent for an extra compliance
                      review before approval.
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </FormSection>

            <FormSection
              id="vendor-documents"
              number="07"
              title="Documents"
              description={`${uploadedCount} of ${applicableDocuments.length} uploaded. The list changes with the entity type.`}
              status={statusOf('vendor-documents')}
            >
              <Grid container spacing={1.5}>
                {applicableDocuments.map((doc) => (
                  <Grid key={doc.key} size={{ xs: 12, sm: 6, md: 4 }}>
                    <DocumentTile
                      label={doc.label}
                      fileName={documents[doc.key]}
                      onSelect={(file) => setDocuments((prev) => ({ ...prev, [doc.key]: file.name }))}
                      onRemove={() =>
                        setDocuments((prev) => {
                          const next = { ...prev };
                          delete next[doc.key];
                          return next;
                        })
                      }
                    />
                  </Grid>
                ))}
              </Grid>
            </FormSection>

            {/* Actions for small screens, where the side rail stacks below. */}
            <Stack direction="row" spacing={1.5} sx={{ display: { lg: 'none' } }}>
              <Button variant="outlined" size="large" onClick={() => navigate('/vendor-registration')}>
                Cancel
              </Button>
              {saveButton}
            </Stack>
            {createVendor.isError && !createVendor.error?.isValidationError ? (
              <Alert severity="error" sx={{ display: { lg: 'none' } }}>
                {createVendor.error?.message || 'Failed to register vendor.'}
              </Alert>
            ) : null}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 3 }} sx={{ display: { xs: 'none', lg: 'block' }, position: 'sticky', top: 72 }}>
          <Card variant="outlined">
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography variant="overline">Progress</Typography>
              <Stack direction="row" alignItems="baseline" spacing={0.75} sx={{ mb: 1 }}>
                <Typography variant="h5" component="p">
                  {completeCount}/{requiredSections.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  sections complete
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={(completeCount / requiredSections.length) * 100}
                color={completeCount === requiredSections.length ? 'success' : 'primary'}
                sx={{ height: 4, borderRadius: 2, mb: 1.5 }}
              />
              <Stack component="nav" aria-label="Form sections" spacing={0.25}>
                {sectionState.map((s, i) => (
                  <Button
                    key={s.id}
                    onClick={() => scrollToSection(s.id)}
                    size="small"
                    color="inherit"
                    startIcon={
                      s.status === 'complete' ? (
                        <CheckCircleIcon color="success" />
                      ) : s.status === 'error' ? (
                        <ErrorOutlineIcon color="error" />
                      ) : (
                        <RadioButtonUncheckedIcon sx={{ color: 'text.disabled' }} />
                      )
                    }
                    sx={{
                      justifyContent: 'flex-start',
                      px: 1,
                      fontWeight: 500,
                      color: s.status === 'error' ? 'error.main' : 'text.primary',
                    }}
                  >
                    <Box component="span" sx={{ color: 'text.secondary', mr: 1, fontSize: 11 }}>
                      {String(i + 1).padStart(2, '0')}
                    </Box>
                    {s.title}
                    {s.id === 'vendor-documents' ? (
                      <Box component="span" sx={{ ml: 'auto', color: 'text.secondary', fontSize: 11 }}>
                        {uploadedCount}/{applicableDocuments.length}
                      </Box>
                    ) : null}
                  </Button>
                ))}
              </Stack>

              <Divider sx={{ my: 1.5 }} />
              <Stack spacing={0.5} sx={{ mb: 2 }}>
                <SummaryRow label="Type" value={isIndividual ? 'Individual' : entityType} />
                <SummaryRow label="TDS" value={values.tdsSection} />
                {!isIndividual ? <SummaryRow label="GST" value={hasGstRegistration === 'Yes' ? 'Registered' : 'Not registered'} /> : null}
                {relatedParty === 'Yes' ? <SummaryRow label="Related party" value="Yes, extra review" warn /> : null}
              </Stack>

              <Stack spacing={1}>
                {saveButton}
                <Button variant="outlined" fullWidth onClick={() => navigate('/vendor-registration')}>
                  Cancel
                </Button>
              </Stack>
              {createVendor.isError && !createVendor.error?.isValidationError ? (
                <Alert severity="error" sx={{ mt: 1.5 }}>
                  {createVendor.error?.message || 'Failed to register vendor.'}
                </Alert>
              ) : null}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

function SummaryRow({ label, value, warn = false }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={1}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="caption" sx={{ fontWeight: 600, color: warn ? 'warning.main' : 'text.primary' }}>
        {value || '—'}
      </Typography>
    </Stack>
  );
}
