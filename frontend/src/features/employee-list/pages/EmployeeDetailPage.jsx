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
  Link,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import BadgeIcon from '@mui/icons-material/Badge';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { ConfirmDialog, DataTable, ErrorState, LoadingState, PageHeader } from '../../../shared/components/index.js';
import { useEmployee, useEmployeeUpdateLogs, useUpdateEmployeeStatus } from '../hooks/useEmployees.js';
import { EMPLOYEE_STATUSES, EMPLOYEE_STATUS_TONE } from '../constants.js';
import { DOCUMENT_FIELDS } from '../mappers/employeeMapper.js';
import { AllocationHistory } from '../../employee-allocation/components/AllocationHistory.jsx';

const UPDATE_LOG_COLUMNS = [
  { key: 'fieldName', header: 'Field', width: 160 },
  { key: 'oldValue', header: 'Old Value', render: (r) => r.oldValue || '—' },
  { key: 'newValue', header: 'New Value', render: (r) => r.newValue || '—' },
  {
    key: 'changedAt',
    header: 'Changed At',
    width: 180,
    render: (r) => new Date(r.changedAt).toLocaleString('en-IN'),
  },
  { key: 'changedBy', header: 'Changed By', width: 160, render: (r) => r.changedBy || '—' },
];

function DetailField({ label, value, chip = null, fullWidth = false }) {
  return (
    <Grid size={fullWidth ? 12 : { xs: 12, sm: 6, md: 4 }}>
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

/** Account number with all but the last four digits hidden. */
function maskAccount(number) {
  if (!number) return null;
  return number.length <= 4 ? number : `${'•'.repeat(number.length - 4)}${number.slice(-4)}`;
}

function formatSize(bytes) {
  if (bytes == null) return '';
  if (bytes < 1024) return `${bytes} B`;
  return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** PAN, salary account and the uploaded PAN Card / Aadhaar Card. */
function BankingAndDocumentsCard({ employee }) {
  const [showAccount, setShowAccount] = useState(false);
  const documents = employee.documents || [];
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
      <CardContent sx={{ p: 3.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2.5 }}>
          PAN, Banking &amp; Documents
        </Typography>
        <Grid container spacing={3}>
          <DetailField
            label="PAN Number"
            chip={
              <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                {employee.panNumber || '—'}
              </Typography>
            }
          />
          <DetailField label="Account Holder Name" value={employee.accountHolderName} />
          <DetailField label="Bank Name" value={employee.bankName} />
          <DetailField label="Account Type" value={employee.accountType} />
          <DetailField
            label="Account Number"
            chip={
              employee.accountNumber ? (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                    {showAccount ? employee.accountNumber : maskAccount(employee.accountNumber)}
                  </Typography>
                  <Link component="button" type="button" variant="caption" onClick={() => setShowAccount((v) => !v)}>
                    {showAccount ? 'Hide' : 'Show'}
                  </Link>
                </Stack>
              ) : null
            }
          />
          <DetailField
            label="IFSC Code"
            chip={
              <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                {employee.ifscCode || '—'}
              </Typography>
            }
          />
          <DetailField label="Branch Name" value={employee.branchName} />
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={2}>
          {DOCUMENT_FIELDS.map(({ type, label }) => {
            const doc = documents.find((d) => d.type === type);
            return (
              <Grid key={type} size={{ xs: 12, md: 6 }}>
                <Typography
                  variant="caption"
                  component="p"
                  color="text.secondary"
                  sx={{ fontWeight: 600, mb: 0.75, textTransform: 'uppercase', letterSpacing: '0.5px' }}
                >
                  {label}
                </Typography>
                {doc ? (
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 2 }}
                  >
                    <InsertDriveFileOutlinedIcon fontSize="small" color="action" />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap title={doc.fileName}>
                        {doc.fileName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatSize(doc.sizeBytes)}
                        {doc.uploadedAt ? ` · uploaded ${new Date(doc.uploadedAt).toLocaleDateString('en-IN')}` : ''}
                      </Typography>
                    </Box>
                    <Button size="small" variant="outlined" href={doc.url} target="_blank" rel="noopener noreferrer">
                      View
                    </Button>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Not uploaded
                  </Typography>
                )}
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
}

export function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const employeeQuery = useEmployee(id);
  const updateStatus = useUpdateEmployeeStatus(id);
  const updateLogsQuery = useEmployeeUpdateLogs(id);
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
              startIcon={<EditIcon />}
              onClick={() => navigate(`/employee-list/${id}/edit`)}
            >
              Edit
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
            <DetailField label="Remark" value={employeeRecord.remark} fullWidth />
          </Grid>
        </CardContent>
      </Card>

      <BankingAndDocumentsCard employee={employeeRecord} />

      <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5, gap: 1, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Allocation History
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Every program / project allocation added, ended or removed for this employee.
              </Typography>
            </Box>
            <Button size="small" variant="outlined" onClick={() => navigate('/employee-allocation')}>
              Manage allocations
            </Button>
          </Stack>
          <AllocationHistory employeeId={employeeRecord.id} />
        </CardContent>
      </Card>

      {/* UPDATE HISTORY */}
      <DataTable
        title="Update History"
        columns={UPDATE_LOG_COLUMNS}
        rows={updateLogsQuery.data || []}
        getRowKey={(r) => r.id}
        isLoading={updateLogsQuery.isPending}
        error={updateLogsQuery.isError ? updateLogsQuery.error : null}
        onRetry={updateLogsQuery.refetch}
        emptyTitle="No changes recorded yet"
        emptyDescription="Edits and status changes will show up here."
      />

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
