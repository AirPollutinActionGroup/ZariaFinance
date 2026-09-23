import { useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import BusinessIcon from '@mui/icons-material/Business';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { PageHeader, RhfTextField, RhfSelect } from '../../../shared/components/index.js';
import {
  organisationCreateSchema,
  organisationCreateDefaults,
} from '../validation/organisationCreateSchema.js';
import { geographyService } from '../../donor-management/services/geographyService.js';
import { useCreateOrganisation, useVerifyShortName } from '../hooks/useOrganisations.js';

/** Lowercase letters only — mirrors the backend's shortName validation. */
const cleanShortName = (value) => value.toLowerCase().replace(/[^a-z]/g, '');

export function OrganisationRegistrationCreatePage() {
  const navigate = useNavigate();
  const createOrganisation = useCreateOrganisation();
  const verifyShortName = useVerifyShortName();
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  // status: 'idle' | 'checking' | 'available' | 'taken' | 'error'; value is the
  // short name that status refers to — any edit afterwards invalidates it.
  const [shortNameCheck, setShortNameCheck] = useState({ status: 'idle', value: '' });

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const { control, handleSubmit, watch, setValue } = useForm({
    resolver: zodResolver(organisationCreateSchema),
    defaultValues: organisationCreateDefaults,
  });

  const selectedState = watch('stateId');
  const shortNameValue = watch('shortName');
  const shortNameVerified =
    shortNameCheck.status === 'available' && shortNameCheck.value === shortNameValue;

  const handleVerifyShortName = async () => {
    const value = shortNameValue.trim().toLowerCase();
    if (!value) return;
    setShortNameCheck({ status: 'checking', value });
    try {
      const available = await verifyShortName.mutateAsync(value);
      setShortNameCheck({ status: available ? 'available' : 'taken', value });
    } catch {
      setShortNameCheck({ status: 'error', value });
    }
  };

  // 1. Fetch States on mount from reusable geography service
  useEffect(() => {
    geographyService
      .listStates(1)
      .then((data) => setStates(data || []))
      .catch((err) => console.error('Error fetching states:', err));
  }, []);

  // 2. Fetch Cities dynamically when a State is selected
  useEffect(() => {
    setValue('cityId', '');
    if (selectedState) {
      geographyService
        .listCities(selectedState)
        .then((data) => setCities(data || []))
        .catch((err) => console.error('Error fetching cities:', err));
    } else {
      setCities([]);
    }
  }, [selectedState, setValue]);

  const onSubmit = async (values) => {
    const created = await createOrganisation.mutateAsync(values);
    navigate(`/organisation-register/${created.id}`);
  };

  return (
    <Box>
      <PageHeader
        title="Register Organisation"
        subtitle="Fill in the details below to register a new partner organisation."
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/organisation-register')}
          >
            Back to List
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            {/* ORGANISATION LOGO HEADER */}
            <Stack direction="row" spacing={2.5} alignItems="center" sx={{ mb: 4, pb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Avatar
                src={logoPreview || undefined}
                sx={{
                  width: 72,
                  height: 72,
                  bgcolor: 'primary.main',
                  fontWeight: 700,
                  fontSize: 28,
                  border: '2px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                }}
              >
                {!logoPreview && <BusinessIcon sx={{ fontSize: 36 }} />}
              </Avatar>

              <Box flex={1}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Organisation Logo
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button
                    component="label"
                    variant="outlined"
                    size="small"
                    startIcon={<UploadFileIcon />}
                    sx={{ fontWeight: 600, borderRadius: 2 }}
                  >
                    Upload Logo
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleLogoChange}
                    />
                  </Button>
                  {logoFile && (
                    <Button
                      variant="text"
                      color="error"
                      size="small"
                      onClick={handleRemoveLogo}
                      sx={{ fontWeight: 600 }}
                    >
                      Remove
                    </Button>
                  )}
                </Stack>
                {logoFile ? (
                  <Typography variant="caption" color="success.main" sx={{ fontWeight: 600, display: 'block', mt: 0.5 }}>
                    ✓ {logoFile.name}
                  </Typography>
                ) : (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    PNG, JPG or SVG formats accepted
                  </Typography>
                )}
              </Box>
            </Stack>

            {/* SECTION 1: GENERAL INFORMATION */}
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
              1. General Information
            </Typography>

            <Grid container spacing={2.5} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <RhfTextField
                  name="name"
                  control={control}
                  label="Organisation Name"
                  placeholder="e.g. Air Pollution Action Group"
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <RhfTextField
                  name="shortName"
                  control={control}
                  label="Organisation Short Name"
                  placeholder="e.g. apag"
                  required
                  onChange={(e) => {
                    setValue('shortName', cleanShortName(e.target.value), { shouldValidate: true });
                    setShortNameCheck({ status: 'idle', value: '' });
                  }}
                  helperText={
                    shortNameCheck.value === shortNameValue
                      ? {
                          available: 'This short name is available.',
                          taken: 'This short name is already taken.',
                          error: 'Could not verify right now — try again.',
                        }[shortNameCheck.status]
                      : 'Lowercase letters only. Click the check icon to verify it is unique.'
                  }
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title={shortNameVerified ? 'Verified — click to re-check' : 'Verify availability'}>
                            <span>
                              <IconButton
                                size="small"
                                edge="end"
                                onClick={handleVerifyShortName}
                                disabled={!shortNameValue || shortNameCheck.status === 'checking'}
                              >
                                {shortNameCheck.status === 'checking' ? (
                                  <CircularProgress size={18} />
                                ) : shortNameVerified ? (
                                  <CheckCircleIcon color="success" fontSize="small" />
                                ) : shortNameCheck.value === shortNameValue && shortNameCheck.status === 'taken' ? (
                                  <CancelIcon color="error" fontSize="small" />
                                ) : (
                                  <FactCheckOutlinedIcon fontSize="small" />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <RhfTextField
                  name="email"
                  control={control}
                  label="Email"
                  type="email"
                  placeholder="contact@organisation.org"
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <RhfTextField
                  name="phone"
                  control={control}
                  label="Phone No"
                  placeholder="+91 98765 43210"
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 8 }}>
                <RhfTextField
                  name="webUrl"
                  control={control}
                  label="Web URL"
                  placeholder="https://www.organisation.org"
                />
              </Grid>
            </Grid>

            <Divider sx={{ mb: 3 }} />

            {/* SECTION 2: ADDRESS & LOCATION DETAILS */}
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
              2. Address & Location Details
            </Typography>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RhfTextField
                  name="address1"
                  control={control}
                  label="Address 1"
                  placeholder="Building / Street Address"
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RhfTextField
                  name="address2"
                  control={control}
                  label="Address 2"
                  placeholder="Suite / Suite No. / Area"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <RhfSelect
                  name="stateId"
                  control={control}
                  label="State"
                  required
                  options={states}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <RhfSelect
                  name="cityId"
                  control={control}
                  label="City"
                  required
                  disabled={!selectedState}
                  options={cities}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <RhfTextField
                  name="zipCode"
                  control={control}
                  label="Zip Code"
                  placeholder="110001"
                  required
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* BOTTOM FORM ACTION BUTTONS */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/organisation-register')}
            sx={{ px: 3, fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Tooltip title={shortNameVerified ? '' : 'Verify the organisation short name is unique before saving'}>
            <span>
              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<SaveIcon />}
                disabled={createOrganisation.isPending || !shortNameVerified}
                sx={{ px: 4, fontWeight: 700, borderRadius: 2 }}
              >
                {createOrganisation.isPending ? 'Saving…' : 'Save Organisation'}
              </Button>
            </span>
          </Tooltip>
        </Stack>
        {createOrganisation.isError ? (
          <Typography color="error.main" sx={{ mt: 2, textAlign: 'right' }}>
            {createOrganisation.error?.message || 'Failed to register organisation.'}
          </Typography>
        ) : null}
      </form>
    </Box>
  );
}
