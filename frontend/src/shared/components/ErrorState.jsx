import { Alert, AlertTitle, Button, Stack } from '@mui/material';

/** Standard error surface; expects an ApiError but tolerates anything. */
export function ErrorState({ error, onRetry }) {
  const message = error?.message || 'Something went wrong.';
  return (
    <Stack sx={{ py: 4 }} alignItems="stretch">
      <Alert
        severity="error"
        action={
          onRetry ? (
            <Button color="inherit" size="small" onClick={onRetry}>
              Retry
            </Button>
          ) : null
        }
      >
        <AlertTitle>Request failed</AlertTitle>
        {message}
      </Alert>
    </Stack>
  );
}
