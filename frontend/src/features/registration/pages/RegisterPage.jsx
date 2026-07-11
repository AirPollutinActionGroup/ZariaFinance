import { Alert, Button, Grid, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { AuthLayout } from '../../auth-pages/AuthLayout.jsx';
import { DevSampleUsers } from '../../auth-pages/DevSampleUsers.jsx';
import { RhfTextField } from '../../../shared/components/index.js';
import { applyServerErrors } from '../../../lib/forms/applyServerErrors.js';
import { registrationService } from '../services/registrationService.js';
import { registerSchema, registerFormDefaults } from '../validation/registerSchema.js';

/**
 * Public account request — POST /api/userRegister. On success the user is
 * routed to the pending-approval screen: accounts are activated only after
 * manual approval by the technology team.
 */
export function RegisterPage() {
  const navigate = useNavigate();
  const { control, handleSubmit, setError } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: registerFormDefaults,
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

  return (
    <AuthLayout maxWidth={560}>
      <Typography variant="h3" component="h1" sx={{ mb: 0.5 }}>
        Request an account
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Access is granted after manual approval by the technology team.
      </Typography>

      <form onSubmit={submit} noValidate>
        <Stack spacing={1}>
          {registerMutation.error && !registerMutation.error.fieldErrors ? (
            <Alert severity="error">{registerMutation.error.message}</Alert>
          ) : null}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RhfTextField name="firstName" control={control} label="First name" required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RhfTextField name="lastName" control={control} label="Last name" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RhfTextField name="emailId" control={control} label="Email" type="email" required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RhfTextField
                name="mobileNo"
                control={control}
                label="Mobile number"
                required
                helperText="10 digits, starting 6–9"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RhfTextField name="username" control={control} label="Username" required />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} />
            <Grid size={{ xs: 12, sm: 6 }}>
              <RhfTextField
                name="password"
                control={control}
                label="Password"
                type="password"
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <RhfTextField
                name="confirmPassword"
                control={control}
                label="Confirm password"
                type="password"
                required
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={registerMutation.isPending}
          >
            {registerMutation.isPending ? 'Submitting…' : 'Submit request'}
          </Button>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
            Already approved?{' '}
            <Link component={RouterLink} to="/login">
              Sign in
            </Link>
          </Typography>
        </Stack>
      </form>

      {import.meta.env.DEV ? <DevSampleUsers /> : null}
    </AuthLayout>
  );
}
