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
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { ConfirmDialog, ErrorState, LoadingState, PageHeader } from '../../../shared/components/index.js';
import { BOOK } from '../../donation-management/constants.js';
import { useBankDetail, useBankDetailLifecycle } from '../hooks/useBankDetails.js';
import { BankAccountNotes } from '../components/BankAccountNotes.jsx';

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

export function BankDetailDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const bankDetailQuery = useBankDetail(id);
  const bankDetailLifecycle = useBankDetailLifecycle();
  const [pendingAction, setPendingAction] = useState(null);

  if (bankDetailQuery.isPending) return <LoadingState label="Loading bank account…" />;
  if (bankDetailQuery.isError) {
    return <ErrorState error={bankDetailQuery.error} onRetry={bankDetailQuery.refetch} />;
  }

  const record = bankDetailQuery.data;
  const isActive = record.status === 'ACTIVE';

  const runLifecycle = async () => {
    await bankDetailLifecycle.mutateAsync({ id: record.id, action: pendingAction });
    setPendingAction(null);
  };

  return (
    <Box>
      <PageHeader
        title={record.bankName}
        subtitle={`${record.accountNumber} · ${record.book} Book`}
        actions={
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              color={isActive ? 'warning' : 'success'}
              onClick={() => setPendingAction(isActive ? 'deactivate' : 'activate')}
              sx={{ fontWeight: 600 }}
            >
              {isActive ? 'Deactivate' : 'Activate'}
            </Button>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/bank-details')}>
              Back to List
            </Button>
          </Stack>
        }
      />

      <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3.5 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
              <AccountBalanceIcon sx={{ fontSize: 28 }} />
            </Avatar>
            <Box flex={1}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {record.bankName}
                </Typography>
                <Chip
                  label={record.statusLabel}
                  color={isActive ? 'success' : 'error'}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Statutory bank account used for receipting and disbursement.
              </Typography>
            </Box>
          </Stack>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <DetailField
              label="Book"
              value={record.book}
              chip={
                <Chip
                  label={`${record.book} · ${BOOK[record.book] || ''}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              }
            />
            <DetailField label="Bank Name" value={record.bankName} />
            <DetailField label="Account Number (A/C)" value={record.accountNumber} />
            <DetailField label="IFSC Code" value={record.ifsc} />
            <DetailField label="Branch Name" value={record.branchName} />
            <DetailField
              label="Status"
              value={record.statusLabel}
              chip={
                <Chip
                  label={record.statusLabel}
                  color={isActive ? 'success' : 'error'}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600, minWidth: 70 }}
                />
              }
            />
          </Grid>
        </CardContent>
      </Card>

      <BankAccountNotes bankAccountId={record.id} />

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title="Change Bank Account Status"
        description={
          pendingAction
            ? `Are you sure you want to change the status of "${record.bankName} (${record.accountNumber})" to ${
                pendingAction === 'activate' ? 'active' : 'inactive'
              }?`
            : ''
        }
        confirmLabel="Confirm"
        confirmColor={pendingAction === 'deactivate' ? 'warning' : 'primary'}
        busy={bankDetailLifecycle.isPending}
        onConfirm={runLifecycle}
        onClose={() => setPendingAction(null)}
      />
    </Box>
  );
}
