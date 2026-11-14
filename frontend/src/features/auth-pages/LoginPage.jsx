import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/index.js';
import { AuthLayout } from './AuthLayout.jsx';

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
  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const destination = location.state?.from || '/';
  // Server-side field messages (e.g. "Password must be between 8 and 100 characters")
  // are shown under the field; the banner is only for errors that aren't about one field.
  const serverFieldErrors = error?.fieldErrors || {};
  const hasFieldErrors = Object.keys(serverFieldErrors).length > 0;
  const usernameError = attempted && !username.trim() ? 'Enter your username' : serverFieldErrors.username;
  const passwordError = attempted && !password ? 'Enter your password' : serverFieldErrors.password;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setAttempted(true);
    setError(null);
    // Catch empty fields here rather than sending them and getting a vague server error back.
    if (!username.trim() || !password) return;
    setBusy(true);
    try {
      await login({ username: username.trim(), password });
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

  const checkCapsLock = (event) => setCapsLock(Boolean(event.getModifierState?.('CapsLock')));

  return (
    <AuthLayout maxWidth={400}>
      <Typography variant="h4" component="h1" sx={{ mb: 0.5 }}>
        Sign in
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Welcome back. Use your A-PAG · TCF account.
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={1.5}>
          {error && !hasFieldErrors ? (
            <Alert severity="error" role="alert">
              {error.message || 'Sign-in failed. Check your username and password and try again.'}
            </Alert>
          ) : null}
          <TextField
            label="Username"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
              if (hasFieldErrors) setError(null);
            }}
            autoComplete="username"
            autoFocus
            fullWidth
            required
            error={Boolean(usernameError)}
            helperText={usernameError || ' '}
          />
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (hasFieldErrors) setError(null);
            }}
            onKeyDown={checkCapsLock}
            onKeyUp={checkCapsLock}
            onBlur={() => setCapsLock(false)}
            autoComplete="current-password"
            fullWidth
            required
            error={Boolean(passwordError)}
            helperText={passwordError || (capsLock ? 'Caps Lock is on' : ' ')}
            slotProps={{
              formHelperText: { sx: { color: !passwordError && capsLock ? 'warning.main' : undefined } },
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={showPassword ? 'Hide password' : 'Show password'}>
                      <IconButton
                        edge="end"
                        size="small"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        {showPassword ? (
                          <VisibilityOffOutlinedIcon fontSize="small" />
                        ) : (
                          <VisibilityOutlinedIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button type="submit" variant="contained" size="large" disabled={busy} sx={{ py: 1.25 }}>
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>
        </Stack>
      </Box>

      <Divider sx={{ my: 3, typography: 'caption', color: 'text.secondary' }}>or</Divider>

      <Button variant="outlined" color="inherit" fullWidth onClick={handleReviewMode}>
        Continue in review mode
      </Button>
      <Typography variant="caption" color="text.secondary" align="center" component="p" sx={{ mt: 0.75 }}>
        Look around the app without signing in.
      </Typography>

      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
        New here?{' '}
        <Link component={RouterLink} to="/register-extended" sx={{ fontWeight: 600 }}>
          Request an account
        </Link>
      </Typography>
    </AuthLayout>
  );
}
