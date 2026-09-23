import { useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  Grid,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { ConfirmDialog, DataTable, ErrorState, LoadingState, PageHeader } from '../../../shared/components/index.js';
import { formatInr } from '../../../lib/format/currency.js';
import { BOOK } from '../../donation-management/constants.js';
import { useBankDetail, useBankDetailLifecycle } from '../hooks/useBankDetails.js';
import { useTransactions } from '../../new-transaction/hooks/useTransactions.js';
import { useFinancialYears } from '../../financial-year/hooks/useFinancialYears.js';

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
  const transactionsQuery = useTransactions();
  const financialYearsQuery = useFinancialYears();
  const [pendingAction, setPendingAction] = useState(null);
  const [typeFilter, setTypeFilter] = useState('All');
  // null = user hasn't touched the FY filter yet, so it defaults to whichever
  // financial year is marked current; 'All'/an id means the user picked it.
  const [fyFilter, setFyFilter] = useState(null);

  const financialYears = financialYearsQuery.data || [];
  const currentFy = financialYears.find((fy) => fy.current) || null;
  const effectiveFyFilter = fyFilter ?? (currentFy ? String(currentFy.id) : 'All');
  const selectedFy = financialYears.find((fy) => String(fy.id) === effectiveFyFilter) || null;

  const accountTransactions = useMemo(() => {
    const rows = transactionsQuery.data || [];
    return rows.filter((tx) => {
      const matchesAccount = String(tx.bankAccountId) === String(id);
      const matchesType = typeFilter === 'All' || tx.type === typeFilter;
      const matchesFy = !selectedFy || (tx.date >= selectedFy.startDate && tx.date <= selectedFy.endDate);
      return matchesAccount && matchesType && matchesFy;
    });
  }, [transactionsQuery.data, id, typeFilter, selectedFy]);

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

      <Card variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
        <CardContent sx={{ p: 3.5 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ sm: 'center' }}
            spacing={1.5}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                Bank Transaction Detail
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Receipts and payments recorded against this account through the Payment Window (Cr/Dr).
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.5}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  displayEmpty
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="All">All Types</MenuItem>
                  <MenuItem value="CREDIT">Credit (In)</MenuItem>
                  <MenuItem value="DEBIT">Debit (Out)</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 170 }}>
                <Select
                  value={effectiveFyFilter}
                  onChange={(e) => setFyFilter(e.target.value)}
                  displayEmpty
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="All">All Financial Years</MenuItem>
                  {financialYears.map((fy) => (
                    <MenuItem key={fy.id} value={String(fy.id)}>
                      {fy.code}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Stack>

          <DataTable
            columns={[
              {
                key: 'id',
                header: 'Transaction ID',
                width: 140,
                render: (r) => (
                  <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                    {r.id}
                  </Typography>
                ),
              },
              { key: 'date', header: 'Date', width: 110 },
              {
                key: 'type',
                header: 'Type',
                width: 110,
                render: (r) => (
                  <Chip
                    label={r.type === 'DEBIT' ? 'Debit (Out)' : 'Credit (In)'}
                    size="small"
                    color={r.type === 'DEBIT' ? 'error' : 'success'}
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                ),
              },
              {
                key: 'partyName',
                header: 'Payee / Donor',
                render: (r) => <b>{r.partyName}</b>,
              },
              { key: 'paymentModeLabel', header: 'Payment Mode' },
              { key: 'reference', header: 'Reference' },
              {
                key: 'amount',
                header: 'Amount',
                align: 'right',
                render: (r) => (
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 700, color: r.type === 'DEBIT' ? 'error.main' : 'success.main' }}
                  >
                    {r.type === 'DEBIT' ? '−' : '+'}
                    {formatInr(r.amount)}
                  </Typography>
                ),
              },
            ]}
            rows={accountTransactions}
            getRowKey={(r) => r.id}
            isLoading={transactionsQuery.isPending}
            error={transactionsQuery.isError ? transactionsQuery.error : null}
            onRetry={transactionsQuery.refetch}
            onRowClick={(r) => navigate(`/new-transaction/${r.id}`)}
            emptyTitle="No transactions on this account"
            emptyDescription="Receipts and payments made through this bank account will appear here."
          />
        </CardContent>
      </Card>

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
