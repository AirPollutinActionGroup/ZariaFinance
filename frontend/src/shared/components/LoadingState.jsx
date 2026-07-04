import { CircularProgress, Stack, Typography } from '@mui/material';

export function LoadingState({ label = 'Loading…' }) {
  return (
    <Stack alignItems="center" spacing={2} sx={{ py: 8 }} role="status" aria-live="polite">
      <CircularProgress size={28} color="primary" />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}
