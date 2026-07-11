import { useState } from 'react';
import { Alert, Box, Button, Divider, Link, Stack, TextField, Typography } from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/index.js';
import { AuthLayout } from './AuthLayout.jsx';
import { DevSampleUsers } from './DevSampleUsers.jsx';

/**
 * Sign-in screen. Submits to the auth repository; while the backend login
 * endpoint is missing the repository rejects with a precise explanation
 * which is shown verbatim. "Review mode" is the sanctioned interim path
 * (ADR-0004) and is clearly labelled throughout the app.
 */
export function LoginPage() {
  const { login, enterReviewMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const destination = location.state?.from || '/';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login({ username, password });
      navigate(destination, { replace: true });
    } catch (loginError) {
      setError(loginError);
    } finally {
      setBusy(false);
    }
  };

  const handleReviewMode = () => {
    enterReviewMode();
    navigate(destination, { replace: true });
  };

  return (
    <AuthLayout>
      <Typography variant="h3" component="h1" sx={{ mb: 0.5 }}>
        Sign in
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Budgeting, Trading &amp; Reporting for A-PAG · TCF
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={2}>
          {error ? <Alert severity="warning">{error.message}</Alert> : null}
          <TextField
            label="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            fullWidth
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            fullWidth
            required
          />
          <Button type="submit" variant="contained" size="large" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>
        </Stack>
      </Box>

      <Divider sx={{ my: 3 }}>or</Divider>

      <Stack spacing={2}>
        <Button variant="outlined" color="inherit" onClick={handleReviewMode}>
          Continue in review mode
        </Button>
        <Typography variant="body2" color="text.secondary" align="center">
          New here?{' '}
          <Link component={RouterLink} to="/register">
            Request an account
          </Link>
        </Typography>
      </Stack>

      {import.meta.env.DEV ? (
        <DevSampleUsers
          onPick={(user) => {
            setUsername(user.username);
            setPassword(user.password);
            setError(null);
          }}
        />
      ) : null}
    </AuthLayout>
  );
}
