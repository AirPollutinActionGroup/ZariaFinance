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
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BadgeIcon from '@mui/icons-material/Badge';
import { ConfirmDialog, ErrorState, LoadingState, PageHeader } from '../../../shared/components/index.js';
import { useEmployee, useUpdateEmployeeStatus } from '../hooks/useEmployees.js';
import { EMPLOYEE_STATUSES, EMPLOYEE_STATUS_TONE } from '../constants.js';

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
  const updateStatus = useUpdateEmployeeStatus(id);
  const [pendingStatus, setPendingStatus] = useState(null);

  if (employeeQuery.isPending) return <LoadingState label="Loading employee…" />;
  if (employeeQuery.isError) {
    return <ErrorState error={employeeQuery.error} onRetry={employeeQuery.refetch} />;
  }

  const employeeRecord = employeeQuery.data;
  const status = employeeRecord.status || 'Active';
  const statusTone = EMPLOYEE_STATUS_TONE[status] || 'default';

  const handleConfirmStatusChange = async () => {
    await updateStatus.mutateAsync(pendingStatus);
    setPendingStatus(null);
  };

  return (
    <Box>
      <PageHeader
        title={employeeRecord.name}
        subtitle={`${employeeRecord.empId} · ${employeeRecord.designationName} · ${employeeRecord.departmentName}`}
        actions={
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Select
              size="small"
              value={status}
              onChange={(e) => {
                if (e.target.value !== status) setPendingStatus(e.target.value);
              }}
              sx={{ minWidth: 200, borderRadius: 2, fontWeight: 600 }}
            >
              {EMPLOYEE_STATUSES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
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
                  color={statusTone}
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
            <DetailField label="Department (F4)" value={employeeRecord.departmentName} />
            <DetailField label="Designation" value={employeeRecord.designationName} />
            <DetailField label="Bucket" value={employeeRecord.bucket} />
            <DetailField
              label="Primary Programme"
              value={(employeeRecord.primaryProgrammeNames || []).join(', ') || 'None'}
            />
            <DetailField label="State" value={(employeeRecord.stateNames || []).join(', ')} />
            <DetailField label="City" value={(employeeRecord.cityNames || []).join(', ') || 'None'} />
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
                  color={statusTone}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600, minWidth: 70 }}
                />
              }
            />
            <DetailField label="Joining Date" value={employeeRecord.joiningDate} />
            <DetailField label="Exit Date" value={employeeRecord.exitDate || 'Still employed'} />
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

      {/* CONFIRM STATUS CHANGE DIALOG */}
      <ConfirmDialog
        open={Boolean(pendingStatus)}
        title="Change Employee Status"
        description={`Change ${employeeRecord.name}'s status from "${status}" to "${pendingStatus}"?`}
        confirmLabel="Confirm"
        confirmColor={pendingStatus === 'Active' ? 'primary' : 'warning'}
        busy={updateStatus.isPending}
        onConfirm={handleConfirmStatusChange}
        onClose={() => setPendingStatus(null)}
      />
    </Box>
  );
}
