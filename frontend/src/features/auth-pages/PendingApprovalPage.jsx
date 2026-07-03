import { Button, Stack, Typography } from '@mui/material';
import HourglassTopOutlinedIcon from '@mui/icons-material/HourglassTopOutlined';
import { useNavigate } from 'react-router-dom';
import { env } from '../../lib/config/env.js';
import { AuthLayout } from './AuthLayout.jsx';

/**
 * Post-registration holding screen. New accounts stay in Pending Approval
 * until manually approved by the approval authority; only then does
 * authentication and authorisation become active.
 */
export function PendingApprovalPage() {
  const navigate = useNavigate();

  return (
    <AuthLayout>
      <Stack spacing={2} alignItems="center" textAlign="center">
        <HourglassTopOutlinedIcon sx={{ fontSize: 44, color: 'text.secondary' }} />
        <Typography variant="h3" component="h1">
          Awaiting approval
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your request was received. Accounts are reviewed and approved manually by{' '}
          <strong>{env.approvalAuthorityEmail}</strong>. You will be able to sign in once your
          account status is <strong>Approved</strong>.
        </Typography>
        <Button variant="contained" onClick={() => navigate('/login')}>
          Back to sign in
        </Button>
      </Stack>
    </AuthLayout>
  );
}
