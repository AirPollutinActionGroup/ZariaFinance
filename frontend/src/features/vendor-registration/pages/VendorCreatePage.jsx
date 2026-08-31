import { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import ContactMailOutlinedIcon from '@mui/icons-material/ContactMailOutlined';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
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
  YES_NO_OPTIONS,
  ENTERPRISE_CLASSIFICATION_OPTIONS,
} from '../constants.js';
import {
  vendorCreateSchema,
  vendorCreateDefaults,
} from '../validation/vendorCreateSchema.js';

function FormSection({ number, icon: Icon, title, description, children }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, mb: 2.5 }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
            }}
          >
            <Icon sx={{ fontSize: 22 }} />
          </Box>
          <Box flex={1} sx={{ pt: 0.25 }}>
            <Stack direction="row" spacing={1} alignItems="baseline">
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: 'primary.main', letterSpacing: '0.06em' }}
              >
                {number}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
            </Stack>
            {description ? (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                {description}
              </Typography>
            ) : null}
          </Box>
        </Stack>
        <Grid container spacing={2.5}>
          {children}
        </Grid>
      </CardContent>
    </Card>
  );
}

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

  const { control, handleSubmit, setValue, setError } = useForm({
    resolver: zodResolver(vendorCreateSchema),
    defaultValues: vendorCreateDefaults,
  });

  const entityType = useWatch({ control, name: 'entityType' });
  const hasIncorporationCertificate = useWatch({ control, name: 'hasIncorporationCertificate' });
  const hasGstRegistration = useWatch({ control, name: 'hasGstRegistration' });
  const hasMsmeRegistration = useWatch({ control, name: 'hasMsmeRegistration' });
  const relatedParty = useWatch({ control, name: 'relatedParty' });
  const isIndividual = entityType === 'Individual';
  const showIncorporationDetails = !isIndividual && hasIncorporationCertificate === 'Yes';
  const showGstDetails = !isIndividual && hasGstRegistration === 'Yes';
  const showMsmeDetails = !isIndividual && hasMsmeRegistration === 'Yes';

  // TDS section default follows entity type — 194J for Individuals, 194C otherwise.
  useEffect(() => {
    setValue('tdsSection', isIndividual ? '194J' : '194C');
  }, [isIndividual, setValue]);

  const applicableDocuments = VENDOR_DOCUMENTS.filter((doc) => {
    if (doc.requiredFor === 'all') return true;
    if (doc.requiredFor === 'individual') return isIndividual;
    return !isIndividual;
  });

  const handleDocumentChange = (key) => (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setDocuments((prev) => ({ ...prev, [key]: file.name }));
    }
  };

  const onSubmit = async (values) => {
    try {
      const created = await createVendor.mutateAsync(values);
      navigate(`/vendor-registration/${created.id}`);
    } catch (error) {
      applyServerErrors(error, setError);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Vendor / Supplier Registration"
        subtitle="Fields adapt automatically based on Entity Type. Fill in the details below to add a vendor to the register."
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/vendor-registration')}
          >
            Back to List
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormSection
          number="01"
          icon={CategoryOutlinedIcon}
          title="Entity Type"
          description="Drives which identification, tax and document fields apply below."
        >
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <RhfSelect
              name="entityType"
              control={control}
              label="Entity Type"
              required
              options={ENTITY_TYPE_OPTIONS}
            />
          </Grid>
        </FormSection>

        <FormSection
          number="02"
          icon={BadgeOutlinedIcon}
          title="Identification"
          description={
            isIndividual
              ? 'Individual vendors are identified by Aadhaar in place of company registration.'
              : 'Date of Incorporation and CIN / Registration No. appear only when an Incorporation Certificate is available.'
          }
        >
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <RhfTextField
              name="legalName"
              control={control}
              label="Legal Name"
              placeholder="e.g. Greenline Logistics Pvt Ltd"
              required
            />
          </Grid>
          {!isIndividual && (
            <>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <RhfSelect
                  name="hasIncorporationCertificate"
                  control={control}
                  label="Incorporation Certificate"
                  required
                  options={YES_NO_OPTIONS}
                  helperText="Select Yes to enter the certificate details."
                />
              </Grid>
              {showIncorporationDetails && (
                <>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <RhfTextField
                      name="dateOfIncorporation"
                      control={control}
                      label="Date of Incorporation"
                      type="date"
                      required
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <RhfTextField
                      name="registrationNo"
                      control={control}
                      label="CIN / Registration No."
                      placeholder="e.g. U60200DL2015PTC281234"
                      required
                    />
                  </Grid>
                </>
              )}
            </>
          )}
          {isIndividual && (
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <RhfTextField
                name="aadhaarNumber"
                control={control}
                label="Aadhaar Number"
                placeholder="12-digit Aadhaar"
                required
                helperText="Used for KYC only — not shown on the ledger."
              />
            </Grid>
          )}
        </FormSection>

        <FormSection
          number="03"
          icon={ReceiptLongOutlinedIcon}
          title="Tax & Statutory"
          description={
            isIndividual
              ? 'GST, TAN and Udyam fields are hidden for Individual vendors.'
              : 'GST Number and Registration Type appear only when GST Registration is Yes.'
          }
        >
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <RhfTextField
              name="panNumber"
              control={control}
              label="PAN Number"
              placeholder="e.g. ABCDE1234F"
              required
            />
          </Grid>
          {!isIndividual && (
            <>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <RhfSelect
                  name="hasGstRegistration"
                  control={control}
                  label="GST Registration"
                  required
                  options={YES_NO_OPTIONS}
                  helperText="Select Yes if the vendor is registered under GST."
                />
              </Grid>
              {showGstDetails && (
                <>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <RhfTextField
                      name="gstNumber"
                      control={control}
                      label="GST Number"
                      placeholder="e.g. 07AAACG1234H1ZC"
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <RhfSelect
                      name="gstRegistrationType"
                      control={control}
                      label="GST Registration Type"
                      required
                      options={GST_REGISTRATION_TYPE_OPTIONS}
                    />
                  </Grid>
                </>
              )}
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <RhfTextField
                  name="tanNumber"
                  control={control}
                  label="TAN Number"
                  placeholder="Only if vendor deducts TDS downstream"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <RhfSelect
                  name="hasMsmeRegistration"
                  control={control}
                  label="MSME Registered"
                  required
                  options={YES_NO_OPTIONS}
                  helperText="Select Yes if the vendor holds Udyam / MSME registration."
                />
              </Grid>
              {showMsmeDetails && (
                <>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <RhfTextField
                      name="udyamNumber"
                      control={control}
                      label="Udyam / MSME Number"
                      placeholder="Triggers the 45-day payment rule"
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <RhfSelect
                      name="enterpriseClassification"
                      control={control}
                      label="Enterprise Classification"
                      required
                      options={ENTERPRISE_CLASSIFICATION_OPTIONS}
                    />
                  </Grid>
                </>
              )}
            </>
          )}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <RhfSelect
              name="tdsSection"
              control={control}
              label="TDS Applicable Section"
              required
              options={TDS_SECTION_OPTIONS}
            />
          </Grid>
        </FormSection>

        <FormSection
          number="04"
          icon={AccountBalanceOutlinedIcon}
          title="Banking Detail"
          description="Enter the vendor's bank account and branch details."
        >
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <RhfTextField name="accountNumber" control={control} label="Account Number" required />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <RhfTextField
              name="ifscCode"
              control={control}
              label="IFSC Code"
              placeholder="e.g. HDFC0000123"
              required
              onChange={(e) =>
                setValue('ifscCode', e.target.value.toUpperCase(), { shouldValidate: true })
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <RhfTextField
              name="accountHolderName"
              control={control}
              label="Account Holder Name"
              required
              helperText="Must match the PAN / Legal Name exactly."
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <RhfTextField
              name="bankName"
              control={control}
              label="Bank Name"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <RhfTextField
              name="branchName"
              control={control}
              label="Branch Name"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <RhfSelect
              name="paymentMode"
              control={control}
              label="Payment Mode Preference"
              required
              disabled={paymentModesQuery.isLoading}
              options={paymentModeOptions}
              helperText={
                paymentModesQuery.isLoading
                  ? 'Loading payment modes…'
                  : paymentModeOptions.length === 0
                    ? 'No active payment modes configured.'
                    : undefined
              }
            />
          </Grid>
        </FormSection>

        <FormSection
          number="05"
          icon={ContactMailOutlinedIcon}
          title="Contact & Address"
          description="State is used to determine GST place-of-supply."
        >
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <RhfTextField name="contactName" control={control} label="Contact Name" required />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <RhfTextField
              name="phoneNumber"
              control={control}
              label="Phone Number"
              placeholder="10-digit mobile number"
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <RhfTextField
              name="contactEmail"
              control={control}
              label="Contact Email"
              type="email"
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 8 }}>
            <RhfTextField
              name="registeredAddress"
              control={control}
              label="Registered Address"
              required
              multiline
              minRows={2}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <RhfSelect name="state" control={control} label="State" required options={states} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <RhfTextField name="pincode" control={control} label="Pincode" required />
          </Grid>
        </FormSection>

        <FormSection
          number="06"
          icon={SellOutlinedIcon}
          title="Classification & Workflow"
        >
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <RhfSelect
              name="vendorCategory"
              control={control}
              label="Vendor Category"
              required
              options={VENDOR_CATEGORY_OPTIONS}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <RhfSelect
              name="relatedParty"
              control={control}
              label="Related Party"
              required
              options={YES_NO_OPTIONS}
              helperText="Is this vendor a related party (director or board member)?"
            />
          </Grid>
          {relatedParty === 'Yes' && (
            <Grid size={12}>
              <Alert severity="warning" variant="outlined">
                This vendor will be flagged as a related party and routed for additional compliance
                review before approval.
              </Alert>
            </Grid>
          )}
        </FormSection>

        <FormSection
          number="07"
          icon={DescriptionOutlinedIcon}
          title="Documents"
          description={
            isIndividual
              ? 'GST Certificate and Incorporation Certificate are not required for Individual vendors.'
              : 'Incorporation Certificate hidden automatically when Entity Type is Individual.'
          }
        >
          <Grid size={12}>
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              {applicableDocuments.map((doc) => (
                <Chip
                  key={doc.key}
                  component="label"
                  clickable
                  variant="outlined"
                  icon={documents[doc.key] ? <CheckCircleIcon color="success" /> : <UploadFileIcon />}
                  label={documents[doc.key] || doc.label}
                  sx={{ fontWeight: 600, py: 2.5, cursor: 'pointer' }}
                >
                  <input type="file" hidden onChange={handleDocumentChange(doc.key)} />
                </Chip>
              ))}
            </Stack>
          </Grid>
        </FormSection>

        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/vendor-registration')}
            sx={{ px: 3, fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<SaveIcon />}
            disabled={createVendor.isPending}
            sx={{ px: 4, fontWeight: 700, borderRadius: 2 }}
          >
            {createVendor.isPending ? 'Saving…' : 'Save Vendor'}
          </Button>
        </Stack>
        {createVendor.isError && !createVendor.error?.isValidationError ? (
          <Typography color="error.main" sx={{ mt: 2, textAlign: 'right' }}>
            {createVendor.error?.message || 'Failed to register vendor.'}
          </Typography>
        ) : null}
      </form>
    </Box>
  );
}
