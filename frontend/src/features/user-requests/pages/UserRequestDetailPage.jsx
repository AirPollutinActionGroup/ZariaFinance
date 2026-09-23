import {
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorState, LoadingState, PageHeader, StatusChip } from '../../../shared/components/index.js';
import { useUserRequest, useUserRequestDecision } from '../hooks/useUserRequests.js';
import { USER_REQUEST_STATUS_TONE } from '../constants.js';

function DetailField({ label, value }) {
  return (
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
      <Typography variant="caption" component="p" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {value || '—'}
      </Typography>
    </Grid>
  );
}

export function UserRequestDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const requestQuery = useUserRequest(id);
  const decision = useUserRequestDecision(id);

  if (requestQuery.isPending) return <LoadingState label="Loading request…" />;
  if (requestQuery.isError) {
    return <ErrorState error={requestQuery.error} onRetry={requestQuery.refetch} />;
  }

  const request = requestQuery.data;
  const tone = USER_REQUEST_STATUS_TONE[request.approvalStatus] || 'neutral';

  return (
    <>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/user-requests')}
        sx={{ mb: 2 }}
      >
        Back to User Requests
      </Button>

      <PageHeader
        title={request.name}
        subtitle={`User Request #${request.id} · ${request.organisation}`}
        actions={
          <Stack direction="row" spacing={1.5} alignItems="center">
            <StatusChip label={request.statusLabel} tone={tone} />
            {request.approvalStatus === 'PENDING' && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleOutlineIcon />}
                  disabled={decision.isPending}
                  onClick={() => decision.mutate('approve')}
                >
                  Approve
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<HighlightOffIcon />}
                  disabled={decision.isPending}
                  onClick={() => decision.mutate('reject')}
                >
                  Reject
                </Button>
              </>
            )}
          </Stack>
        }
      />

      <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          {/* SECTION 1: USER DETAILS */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <PersonOutlineIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              User Information
            </Typography>
          </Stack>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <DetailField label="FULL NAME" value={request.name} />
            <DetailField label="USERNAME" value={request.username} />
            <DetailField label="EMAIL ID" value={request.email} />
            <DetailField label="PHONE NUMBER" value={request.phone} />
            <DetailField label="ROLE" value={request.role} />
            <DetailField label="ORGANISATION" value={request.organisation} />
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* SECTION 2: APPROVAL & AUDIT DETAILS */}
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <VerifiedUserOutlinedIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Approval & Audit Information
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            <DetailField label="CREATED" value={request.createdAtLabel} />
            <DetailField label="APPROVED BY" value={request.approvedBy} />
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography variant="caption" component="p" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                STATUS
              </Typography>
              <StatusChip label={request.statusLabel} tone={tone} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  );
}
