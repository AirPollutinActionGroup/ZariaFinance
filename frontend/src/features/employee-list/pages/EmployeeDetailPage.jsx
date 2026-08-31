import { useState } from 'react';
import {
  Avatar,
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
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BadgeIcon from '@mui/icons-material/Badge';
import { ConfirmDialog, ErrorState, LoadingState, PageHeader } from '../../../shared/components/index.js';
import { useEmployee, useEmployeeLifecycle } from '../hooks/useEmployees.js';

function DetailField({ label, value, chip = null }) {
  return (
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
      <Typography
        variant="caption"
        component="p"
        color="text.secondary"
        sx={{ fontWeight: 600, mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px' }}
      >
        {label}
      </Typography>
      {chip || (
        <Typography variant="body1" sx={{ fontWeight: 500 }}>
          {value || '—'}
        </Typography>
      )}
    </Grid>
  );
}

export function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const employeeQuery = useEmployee(id);
  const lifecycle = useEmployeeLifecycle(id);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (employeeQuery.isPending) return <LoadingState label="Loading employee…" />;
  if (employeeQuery.isError) {
    return <ErrorState error={employeeQuery.error} onRetry={employeeQuery.refetch} />;
  }

  const employeeRecord = employeeQuery.data;
  const status = employeeRecord.status || 'Active';
  const isActive = status === 'Active';

  const handleConfirmStatusChange = async () => {
    await lifecycle.mutateAsync(isActive ? 'deactivate' : 'activate');
    setDialogOpen(false);
  };

  const dialogDescription = isActive
    ? 'Are you sure you want to change the status of the employee from active to inactive?'
    : 'Are you sure you want to change the status of the employee from inactive to active?';

  return (
    <Box>
      <PageHeader
        title={employeeRecord.name}
        subtitle={`${employeeRecord.empId} · ${employeeRecord.designation} · ${employeeRecord.department}`}
        actions={
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              color={isActive ? 'warning' : 'success'}
              onClick={() => setDialogOpen(true)}
              sx={{ fontWeight: 600 }}
            >
              {isActive ? 'Mark Inactive' : 'Mark Active'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/employee-list')}
            >
              Back to List
            </Button>
          </Stack>
        }
      />

      {/* SINGLE UNIFIED EMPLOYEE DETAILS CARD */}
      <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3.5 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
              <BadgeIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box flex={1}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {employeeRecord.name}
                </Typography>
                <Chip
                  label={status}
                  color={isActive ? 'success' : 'error'}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Department and state map to F4 cost centres. Bucket determines which F3 ledger the cost posts to.
              </Typography>
            </Box>
            <Chip
              label={employeeRecord.empId}
              variant="outlined"
              sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 13, px: 0.5 }}
            />
          </Stack>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <DetailField
              label="Employee ID"
              value={employeeRecord.empId}
              chip={
                <Typography variant="body1" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                  {employeeRecord.empId}
                </Typography>
              }
            />
            <DetailField label="Employee Name" value={employeeRecord.name} />
            <DetailField label="Department (F4)" value={employeeRecord.department} />
            <DetailField label="Designation" value={employeeRecord.designation} />
            <DetailField label="Bucket" value={employeeRecord.bucket} />
            <DetailField label="Primary Programme" value={employeeRecord.primaryProgramme || 'None'} />
            <DetailField label="State" value={employeeRecord.state} />
            <DetailField
              label="Employment Type"
              value={employeeRecord.employmentType}
              chip={
                <Chip
                  label={employeeRecord.employmentType}
                  size="small"
                  variant="outlined"
                  color={employeeRecord.employmentType === 'Permanent' ? 'default' : 'secondary'}
                  sx={{ fontWeight: 600 }}
                />
              }
            />
            <DetailField
              label="Status"
              value={status}
              chip={
                <Chip
                  label={status}
                  color={isActive ? 'success' : 'error'}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600, minWidth: 70 }}
                />
              }
            />
            <DetailField
              label="Provident Fund (PF)"
              value={employeeRecord.pf}
              chip={
                <Chip
                  label={employeeRecord.pf}
                  size="small"
                  color={employeeRecord.pf === 'Yes' ? 'success' : 'default'}
                  variant="outlined"
                  sx={{ fontWeight: 600, minWidth: 50 }}
                />
              }
            />
            <DetailField
              label="Employee State Insurance (ESI)"
              value={employeeRecord.esi}
              chip={
                <Chip
                  label={employeeRecord.esi}
                  size="small"
                  color={employeeRecord.esi === 'Yes' ? 'success' : 'default'}
                  variant="outlined"
                  sx={{ fontWeight: 600, minWidth: 50 }}
                />
              }
            />
            <DetailField
              label="Gratuity"
              value={employeeRecord.gratuity}
              chip={
                <Chip
                  label={employeeRecord.gratuity}
                  size="small"
                  color={employeeRecord.gratuity === 'Yes' ? 'success' : 'default'}
                  variant="outlined"
                  sx={{ fontWeight: 600, minWidth: 50 }}
                />
              }
            />
            <DetailField
              label="Annual CTC (Rs)"
              value={`₹ ${Number(employeeRecord.annualCtc).toLocaleString('en-IN')}`}
              chip={
                <Typography variant="body1" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                  ₹ {Number(employeeRecord.annualCtc).toLocaleString('en-IN')}
                </Typography>
              }
            />
          </Grid>
        </CardContent>
      </Card>

      {/* CONFIRM STATUS TOGGLE DIALOG */}
      <ConfirmDialog
        open={dialogOpen}
        title="Change Employee Status"
        description={dialogDescription}
        confirmLabel="Confirm"
        confirmColor={isActive ? 'warning' : 'primary'}
        busy={lifecycle.isPending}
        onConfirm={handleConfirmStatusChange}
        onClose={() => setDialogOpen(false)}
      />
    </Box>
  );
}
