import { useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Grid,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { AuthLayout } from '../../auth-pages/AuthLayout.jsx';
import { RhfTextField, RhfSelect } from '../../../shared/components/index.js';
import { applyServerErrors } from '../../../lib/forms/applyServerErrors.js';
import { registrationService } from '../services/registrationService.js';
import {
  registerExtendedSchema,
  registerExtendedFormDefaults,
} from '../validation/registerExtendedSchema.js';
import { useRoles } from '../../../hooks/useRoles.js';

const ORGANISATION_OPTIONS = [
  { value: 'APAG', label: 'APAG' },
];

const DEFAULT_ROLE_OPTIONS = [
  { value: 'CEO', label: 'CEO' },
  { value: 'CFO', label: 'CFO' },
  { value: 'Finance / Accounts Officer', label: 'Finance / Accounts Officer' },
  { value: 'Fundraising Team', label: 'Fundraising Team' },
];

export function RegisterExtendedPage() {
  const navigate = useNavigate();
  const { roles, loading: rolesLoading } = useRoles();
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);

  const handleProfilePicChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'image/png' && !file.name.toLowerCase().endsWith('.png')) {
        alert('Please select a valid PNG image file (.png).');
        return;
      }
      setProfilePic(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveProfilePic = () => {
    setProfilePic(null);
    setProfilePicPreview(null);
  };

  const { control, handleSubmit, setError } = useForm({
    resolver: zodResolver(registerExtendedSchema),
    defaultValues: registerExtendedFormDefaults,
  });

  const registerMutation = useMutation({
    mutationFn: (values) => registrationService.register(values),
  });

  const submit = handleSubmit(async (values) => {
    try {
      await registerMutation.mutateAsync(values);
      navigate('/pending-approval', { replace: true });
    } catch (error) {
      applyServerErrors(error, setError);
    }
  });

  const roleOptions =
    Array.isArray(roles) && roles.length > 0
      ? roles.map((r) => ({
          value: r.value || r.name || r.id,
          label: r.label || r.name || r.id,
        }))
      : DEFAULT_ROLE_OPTIONS;

  return (
    <AuthLayout maxWidth={980}>
      {/* Header Title */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" align="center" sx={{ fontWeight: 700 }}>
          Request An Account
        </Typography>
      </Box>

      <form onSubmit={submit} noValidate>
        <Stack spacing={3}>
          {registerMutation.error && !registerMutation.error.fieldErrors ? (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {registerMutation.error.message}
            </Alert>
          ) : null}

          <Grid container spacing={2}>
            {/* ROW 1: 3 Fields */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <RhfTextField name="firstName" control={control} label="First name" required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <RhfTextField name="lastName" control={control} label="Last name" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <RhfTextField
                name="emailId"
                control={control}
                label="Email"
                type="email"
                required
              />
            </Grid>

            {/* ROW 2: 3 Fields */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <RhfTextField
                name="mobileNo"
                control={control}
                label="Mobile number"
                type="number"
                inputMode="numeric"
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <RhfTextField name="username" control={control} label="Username" required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <RhfSelect
                name="role"
                control={control}
                label="Role"
                required
                options={roleOptions}
                disabled={rolesLoading}
              />
            </Grid>

            {/* ROW 3: 3 Fields */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <RhfSelect
                name="organisation"
                control={control}
                label="Organisation"
                required
                options={ORGANISATION_OPTIONS}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <RhfTextField
                name="password"
                control={control}
                label="Password"
                type="password"
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <RhfTextField
                name="confirmPassword"
                control={control}
                label="Confirm password"
                type="password"
                required
              />
            </Grid>
          </Grid>

          {/* BOTTOM SECTION: PROFILE PIC UPLOAD (LEFT BOTTOM) & SUBMIT BUTTON (RIGHT BOTTOM) */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', sm: 'flex-end' }}
            justifyContent="space-between"
            sx={{ pt: 1 }}
          >
            {/* LEFT BOTTOM: Profile Picture Upload & Sign In Link */}
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  src={profilePicPreview || undefined}
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: 'primary.main',
                    fontWeight: 700,
                    fontSize: 18,
                    border: '2px solid',
                    borderColor: 'divider',
                  }}
                >
                  {!profilePicPreview && <PersonOutlineIcon sx={{ fontSize: 26 }} />}
                </Avatar>

                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                      component="label"
                      variant="outlined"
                      size="small"
                      startIcon={<UploadFileIcon />}
                      sx={{ fontWeight: 600, borderRadius: 2 }}
                    >
                      Upload Picture
                      <input
                        type="file"
                        accept="image/png"
                        hidden
                        onChange={handleProfilePicChange}
                      />
                    </Button>
                    {profilePic && (
                      <Button
                        variant="text"
                        color="error"
                        size="small"
                        onClick={handleRemoveProfilePic}
                        sx={{ fontWeight: 600 }}
                      >
                        Remove
                      </Button>
                    )}
                  </Stack>
                  {profilePic ? (
                    <Typography variant="caption" color="success.main" sx={{ fontWeight: 600, display: 'block', mt: 0.5 }}>
                      ✓ {profilePic.name}
                    </Typography>
                  ) : (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      PNG format only
                    </Typography>
                  )}
                </Box>
              </Stack>

              <Typography variant="body2" color="text.secondary">
                Already approved?{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  underline="hover"
                  fontWeight={700}
                >
                  Sign in to your account
                </Link>
              </Typography>
            </Stack>

            {/* RIGHT BOTTOM: Submit Request Button */}
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={registerMutation.isPending}
              endIcon={!registerMutation.isPending && <ArrowForwardIcon />}
              sx={{
                py: 1.5,
                px: 4,
                fontSize: 15,
                fontWeight: 700,
                borderRadius: 2.5,
                boxShadow: (t) => t.shadows[4],
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: (t) => t.shadows[8],
                },
              }}
            >
              {registerMutation.isPending ? 'Submitting request…' : 'Submit Request'}
            </Button>
          </Stack>
        </Stack>
      </form>
    </AuthLayout>
  );
}
