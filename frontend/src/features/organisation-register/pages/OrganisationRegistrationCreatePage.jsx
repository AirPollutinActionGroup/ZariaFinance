import { useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import BusinessIcon from '@mui/icons-material/Business';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PageHeader, RhfTextField, RhfSelect } from '../../../shared/components/index.js';
import {
  organisationCreateSchema,
  organisationCreateDefaults,
} from '../validation/organisationCreateSchema.js';
import { geographyService } from '../../donor-management/services/geographyService.js';

export function OrganisationRegistrationCreatePage() {
  const navigate = useNavigate();
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

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

  const selectedState = watch('state');

  // 1. Fetch States on mount from reusable geography service
  useEffect(() => {
    geographyService
      .listStates(1)
      .then((data) => setStates(data || []))
      .catch((err) => console.error('Error fetching states:', err));
  }, []);

  // 2. Fetch Cities dynamically when a State is selected
  useEffect(() => {
    setValue('city', '');
    if (selectedState) {
      geographyService
        .listCities(selectedState)
        .then((data) => setCities(data || []))
        .catch((err) => console.error('Error fetching cities:', err));
    } else {
      setCities([]);
    }
  }, [selectedState, setValue]);

  const onSubmit = (values) => {
    console.log('Registering Organisation:', { ...values, logo: logoFile });
    alert(`Organisation "${values.name}" registered successfully!`);
    navigate('/organisation-register');
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
                  placeholder="e.g. APAG"
                  required
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
                  name="state"
                  control={control}
                  label="State"
                  required
                  options={states}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <RhfSelect
                  name="city"
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
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<SaveIcon />}
            sx={{ px: 4, fontWeight: 700, borderRadius: 2 }}
          >
            Save Organisation
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
