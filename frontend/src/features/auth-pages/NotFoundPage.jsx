import { Button, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <Stack spacing={2} alignItems="center" sx={{ py: 10, textAlign: 'center' }}>
      <Typography variant="h1" component="p">
        404
      </Typography>
      <Typography variant="body1" color="text.secondary">
        The page you are looking for does not exist or you do not have access to it.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        Go home
      </Button>
    </Stack>
  );
}
