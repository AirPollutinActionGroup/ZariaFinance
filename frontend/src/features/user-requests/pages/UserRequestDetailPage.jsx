import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
import { PageHeader } from '../../../shared/components/index.js';
import { MOCK_USER_REQUESTS } from '../data/mockRequests.js';

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

  const initialRequest = MOCK_USER_REQUESTS.find((r) => String(r.id) === String(id)) || MOCK_USER_REQUESTS[0];
  const [request, setRequest] = useState(initialRequest);

  const handleApprove = () => {
    const now = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    setRequest((prev) => ({
      ...prev,
      status: 'Approved',
      approvedBy: 'Tech Admin (ceoadmin)',
      approvedAt: now,
    }));
  };

  const handleReject = () => {
    const now = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    setRequest((prev) => ({
      ...prev,
      status: 'Rejected',
      approvedBy: 'System Administrator',
      approvedAt: now,
    }));
  };

  let statusColor = 'default';
  if (request.status === 'Approved') statusColor = 'success';
  else if (request.status === 'Rejected') statusColor = 'error';
  else if (request.status === 'Pending') statusColor = 'warning';

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
        subtitle={`User Request #${request.srNo} · ${request.organisation}`}
        actions={
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              label={request.status}
              color={statusColor}
              variant="outlined"
              sx={{ fontWeight: 700, px: 1 }}
            />
            {request.status === 'Pending' && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleOutlineIcon />}
                  onClick={handleApprove}
                >
                  Approve
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<HighlightOffIcon />}
                  onClick={handleReject}
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
            <DetailField label="CREATED" value={request.createdAt} />
            <DetailField label="APPROVED BY" value={request.approvedBy} />
            <DetailField label="APPROVED AT" value={request.approvedAt} />
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography variant="caption" component="p" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                STATUS
              </Typography>
              <Chip
                label={request.status}
                color={statusColor}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </>
  );
}
