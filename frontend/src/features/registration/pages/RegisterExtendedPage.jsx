import { useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { AuthLayout } from '../../auth-pages/AuthLayout.jsx';
import { RhfTextField, RhfSelect } from '../../../shared/components/index.js';
import { applyServerErrors } from '../../../lib/forms/applyServerErrors.js';
import { registrationService } from '../services/registrationService.js';
import {
  registerExtendedSchema,
  registerExtendedFormDefaults,
} from '../validation/registerExtendedSchema.js';
import { useRoles } from '../../role-directory/hooks/useRoles.js';
import { useOrganisations } from '../../organisation-register/hooks/useOrganisations.js';

export function RegisterExtendedPage() {
  const navigate = useNavigate();
  const { data: roles, isLoading: rolesLoading } = useRoles();
  const { data: organisations, isLoading: organisationsLoading } = useOrganisations();
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const {
    control,
    handleSubmit,
    setError,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerExtendedSchema),
    defaultValues: registerExtendedFormDefaults,
  });

  const registerMutation = useMutation({
    mutationFn: (values) => registrationService.registerExtended(values),
  });

  const submit = handleSubmit(async (values) => {
    try {
      await registerMutation.mutateAsync(values);
      navigate('/pending-approval', { replace: true });
    } catch (error) {
      applyServerErrors(error, setError);
    }
  });

  const roleOptions = (roles || [])
    .filter((r) => r.status === 'ACTIVE')
    .map((r) => ({ value: r.id, label: r.roleName }));

  const organisationOptions = (organisations || [])
    .filter((o) => o.status === 'ACTIVE')
    .map((o) => ({ value: o.id, label: o.name }));

  // Username is the role's short name plus a fixed "@<organisation short
  // name>" suffix, e.g. role "ceo" + organisation "zto" → "ceo@zto". Only
  // the role side is user-editable — the organisation suffix renders as a
  // static, non-editable adornment so it can never be typed over.
  const roleValue = watch('role');
  const organisationValue = watch('organisation');

  const selectedRole = (roles || []).find((r) => r.id === roleValue);
  const selectedOrganisation = (organisations || []).find((o) => o.id === organisationValue);
  const organisationShortName = selectedOrganisation?.shortName || '';

  const [usernameLocalPart, setUsernameLocalPart] = useState('');
  const fullUsername =
    usernameLocalPart && organisationShortName
      ? `${usernameLocalPart}@${organisationShortName}`
      : '';

  useEffect(() => {
    setValue('username', fullUsername, { shouldValidate: Boolean(fullUsername) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullUsername]);

  const verifyUsername = useMutation({
    mutationFn: (username) => registrationService.isUsernameAvailable(username),
  });

  // status: 'idle' | 'checking' | 'available' | 'taken' | 'error'; value is
  // the full username that status refers to — any edit afterwards
  // invalidates it.
  const [usernameCheck, setUsernameCheck] = useState({ status: 'idle', value: '' });
  const usernameVerified =
    usernameCheck.status === 'available' && usernameCheck.value === fullUsername;

  const runUsernameCheck = async (value) => {
    if (!value) return;
    setUsernameCheck({ status: 'checking', value });
    try {
      const available = await verifyUsername.mutateAsync(value);
      setUsernameCheck({ status: available ? 'available' : 'taken', value });
    } catch {
      setUsernameCheck({ status: 'error', value });
    }
  };

  // Role + organisation can share a base username (e.g. two "Fundraising
  // Team" members at the same org both derive "fundraising@apag"), so on a
  // collision this appends a number to the role side — fundraising2@apag,
  // fundraising3@apag — until it finds one that's free.
  const MAX_USERNAME_SUFFIX = 20;
  const resolveUsername = async (roleShortName, orgShortName) => {
    setUsernameCheck({ status: 'checking', value: `${roleShortName}@${orgShortName}` });
    try {
      for (let suffix = 1; suffix <= MAX_USERNAME_SUFFIX; suffix += 1) {
        const candidateLocal = suffix === 1 ? roleShortName : `${roleShortName}${suffix}`;
        const candidateFull = `${candidateLocal}@${orgShortName}`;
        // Sequential by design — stop at the first free candidate.
        const available = await registrationService.isUsernameAvailable(candidateFull);
        if (available) {
          setUsernameLocalPart(candidateLocal);
          setUsernameCheck({ status: 'available', value: candidateFull });
          return;
        }
      }
      setUsernameLocalPart(roleShortName);
      setUsernameCheck({ status: 'taken', value: `${roleShortName}@${orgShortName}` });
    } catch {
      setUsernameLocalPart(roleShortName);
      setUsernameCheck({ status: 'error', value: `${roleShortName}@${orgShortName}` });
    }
  };

  useEffect(() => {
    if (selectedRole?.shortName && organisationShortName) {
      resolveUsername(selectedRole.shortName, organisationShortName);
    }
    // Recompute only when the derived pieces change — resolveUsername is
    // stable enough for this effect's purpose.
  }, [selectedRole?.shortName, organisationShortName]);

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
              <RhfSelect
                name="organisation"
                control={control}
                label="Organisation"
                required
                options={organisationOptions}
                disabled={organisationsLoading}
              />
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
              <TextField
                label="Username"
                required
                fullWidth
                value={usernameLocalPart}
                disabled={!selectedRole || !organisationShortName}
                onChange={(e) => {
                  setUsernameLocalPart(e.target.value);
                  setUsernameCheck({ status: 'idle', value: '' });
                }}
                error={Boolean(errors.username)}
                helperText={
                  errors.username?.message ||
                  (usernameCheck.value === fullUsername
                    ? {
                        checking: 'Checking availability…',
                        available: 'This username is available.',
                        taken: 'This username is already taken.',
                        error: 'Could not verify right now — try again.',
                      }[usernameCheck.status]
                    : 'Select a role and organisation to generate this.')
                }
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ whiteSpace: 'nowrap', mr: 0.5, userSelect: 'none' }}
                        >
                          @{organisationShortName || '…'}
                        </Typography>
                        <Tooltip title={usernameVerified ? 'Verified — click to re-check' : 'Verify availability'}>
                          <span>
                            <IconButton
                              size="small"
                              edge="end"
                              onClick={() => runUsernameCheck(fullUsername)}
                              disabled={!fullUsername || usernameCheck.status === 'checking'}
                            >
                              {usernameCheck.status === 'checking' ? (
                                <CircularProgress size={18} />
                              ) : usernameVerified ? (
                                <CheckCircleIcon color="success" fontSize="small" />
                              ) : usernameCheck.value === fullUsername && usernameCheck.status === 'taken' ? (
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
                name="password"
                control={control}
                label="Password"
                type={showPassword ? 'text' : 'password'}
                required
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          edge="end"
                          onClick={() => setShowPassword((prev) => !prev)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <RhfTextField
                name="confirmPassword"
                control={control}
                label="Confirm password"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          edge="end"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
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
            <Tooltip title={usernameVerified ? '' : 'Verify the username is unique before submitting'}>
              <span>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={registerMutation.isPending || !usernameVerified}
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
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      </form>
    </AuthLayout>
  );
}
