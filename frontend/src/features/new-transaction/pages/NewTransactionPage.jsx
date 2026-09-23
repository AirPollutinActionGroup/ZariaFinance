import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../shared/components/index.js';
import { SearchableSelect } from '../../../components/SearchableSelect.jsx';
import { formatInr } from '../../../lib/format/currency.js';
import { usePaymentModes } from '../../payment-mode/hooks/usePaymentModes.js';
import { usePaymentTypeGroups } from '../../payment-type/hooks/usePaymentTypeGroups.js';
import { usePaymentTypeLedgers } from '../../payment-type/hooks/usePaymentTypeLedgers.js';
import { useDonors } from '../../donor-management/hooks/useDonors.js';
import { useFundProfilesByDonor } from '../../donor-management/hooks/useFundProfiles.js';
import { useGrants } from '../../donor-management/hooks/useGrants.js';
import { useCreateTransaction } from '../hooks/useTransactions.js';
import {
  BANK_ACCOUNTS,
  BOOKS,
  DONOR_TYPES,
  PAYEE_CATEGORIES,
  PAYEES,
  TRANSACTION_TYPES,
} from '../data/mockNewTransaction.js';

export function NewTransactionPage() {
  const navigate = useNavigate();
  const [type, setType] = useState('DEBIT');
  const [book, setBook] = useState('LC');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('EMPLOYEE');
  const [partyId, setPartyId] = useState('');
  const [donorId, setDonorId] = useState('');
  const [fundId, setFundId] = useState('');
  const [grantId, setGrantId] = useState('');
  const [amount, setAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [reference, setReference] = useState('');
  const [group, setGroup] = useState('');
  const [ledgerType, setLedgerType] = useState('');
  const [notes, setNotes] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const isCredit = type === 'CREDIT';

  // Payment mode, Group and Ledger are the real Payment Mode / Payment Type
  // (Group ▸ Ledger) master data — server-backed, not mock — for both Debit
  // (Out) and Credit (In) transactions; it's the same chart of accounts.
  const paymentModesQuery = usePaymentModes();
  const paymentModeOptions = useMemo(
    () =>
      (paymentModesQuery.data || [])
        .filter((m) => m.status === 'ACTIVE')
        .map((m) => ({ value: m.id, label: m.name })),
    [paymentModesQuery.data]
  );

  const groupsQuery = usePaymentTypeGroups();
  const groupOptions = useMemo(
    () =>
      (groupsQuery.data || [])
        .filter((g) => g.status === 'ACTIVE')
        .map((g) => ({ value: g.id, label: g.name })),
    [groupsQuery.data]
  );

  const ledgersQuery = usePaymentTypeLedgers();

  const categoryOptions = isCredit ? DONOR_TYPES : PAYEE_CATEGORIES;

  // Ledger accounts cascade from the selected Group, same as the Transaction Entry page.
  const ledgerOptions = useMemo(() => {
    return (ledgersQuery.data || [])
      .filter((l) => l.status === 'ACTIVE' && l.groupId === group)
      .map((l) => ({ value: l.id, label: l.name }));
  }, [group, ledgersQuery.data]);

  // Donor, Fund profile and Grant agreement are the real donor-management
  // master data — server-backed, not mock — for both Debit and Credit.
  const donorsQuery = useDonors();
  const donors = useMemo(() => donorsQuery.data || [], [donorsQuery.data]);

  const partyOptions = useMemo(() => {
    if (!isCredit) {
      return PAYEES.filter((p) => p.category === category).map((p) => ({ value: p.id, label: p.name }));
    }
    return donors.filter((d) => d.donorType === category).map((d) => ({ value: d.id, label: d.donorName }));
  }, [isCredit, category, donors]);

  // The donor whose fund is being credited or debited — kept separate from the
  // Payee/Donor party field so a Debit (expense) can still be charged to a
  // specific donor's restricted fund.
  const donorOptions = useMemo(() => donors.map((d) => ({ value: d.id, label: d.donorName })), [donors]);

  const fundProfilesQuery = useFundProfilesByDonor(donorId || undefined);
  const fundOptions = useMemo(() => {
    return (fundProfilesQuery.data || []).map((f) => {
      const hasDisbursementData = (f.disbursementRules || []).length > 0;
      const balance = hasDisbursementData
        ? f.disbursementRules.reduce((sum, r) => sum + (Number(r.unallocatedAmount) || 0), 0)
        : null;
      return {
        value: f.id,
        label: f.purpose || `${f.fundClassLabel || 'Fund profile'} · #${f.id}`,
        balance,
      };
    });
  }, [fundProfilesQuery.data]);

  const currentFund = useMemo(
    () => fundOptions.find((f) => f.value === fundId) || null,
    [fundOptions, fundId]
  );

  const grantsQuery = useGrants(donorId ? { donorId } : undefined);
  const grantOptions = useMemo(() => {
    if (!fundId) return [];
    return (grantsQuery.data || [])
      .filter((g) => g.fundProfileId === fundId)
      .map((g) => ({ value: g.id, label: g.grantCode }));
  }, [fundId, grantsQuery.data]);

  const projectedBalance = useMemo(() => {
    if (!currentFund || currentFund.balance == null) return null;
    const amt = Number(amount) || 0;
    return type === 'DEBIT' ? currentFund.balance - amt : currentFund.balance + amt;
  }, [currentFund, amount, type]);

  const insufficientBalance =
    type === 'DEBIT' && currentFund && currentFund.balance != null && projectedBalance !== null && projectedBalance < 0;

  function handleTypeChange(_event, newType) {
    if (!newType) return;
    setType(newType);
    const nextCategory = newType === 'CREDIT' ? DONOR_TYPES[0].value : PAYEE_CATEGORIES[0].value;
    setCategory(nextCategory);
    setPartyId('');
    setDonorId('');
    setFundId('');
    setGrantId('');
    setGroup('');
    setLedgerType('');
  }

  function handleGroupChange(newValue) {
    setGroup(newValue?.value || '');
    setLedgerType('');
  }

  function handleCategoryChange(newValue) {
    setCategory(newValue?.value || '');
    setPartyId('');
    setFundId('');
    setGrantId('');
  }

  function handlePartyChange(newValue) {
    const newPartyId = newValue?.value || '';
    setPartyId(newPartyId);
    // For a Credit, the payee field IS the donor — keep the Donor field in sync.
    if (isCredit) {
      setDonorId(newPartyId);
      setFundId('');
      setGrantId('');
    }
  }

  function handleDonorChange(newValue) {
    const newDonorId = newValue?.value || '';
    setDonorId(newDonorId);
    if (isCredit) {
      setPartyId(newDonorId);
    }
    setFundId('');
    setGrantId('');
  }

  function handleFundChange(newValue) {
    setFundId(newValue?.value || '');
    setGrantId('');
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    setAttachment(file || null);
  }

  const createTransaction = useCreateTransaction();

  async function handleSubmit(e) {
    e.preventDefault();

    if (!amount || Number(amount) <= 0) {
      setToastMessage({ type: 'error', text: 'Please enter a valid amount.' });
      return;
    }

    if (!partyId) {
      setToastMessage({
        type: 'error',
        text: isCredit ? 'Please select a donor.' : 'Please select a payee.',
      });
      return;
    }

    if (!donorId) {
      setToastMessage({ type: 'error', text: 'Please select a donor to fund this transaction from.' });
      return;
    }

    if (!fundId) {
      setToastMessage({ type: 'error', text: 'Please select a fund profile.' });
      return;
    }

    if (!paymentMode) {
      setToastMessage({ type: 'error', text: 'Please select a payment mode.' });
      return;
    }

    if (!group || !ledgerType) {
      setToastMessage({ type: 'error', text: 'Please select a Group and Ledger.' });
      return;
    }

    if (insufficientBalance) {
      setToastMessage({
        type: 'error',
        text: `Insufficient balance — only ${formatInr(currentFund.balance)} available in this fund.`,
      });
      return;
    }

    const partyName = partyOptions.find((o) => o.value === partyId)?.label || '';

    try {
      await createTransaction.mutateAsync({
        type,
        book,
        date,
        category,
        partyId,
        partyName,
        donorId,
        fundId,
        grantId,
        amount,
        bankAccount,
        paymentMode,
        reference,
        group,
        ledgerType,
        notes,
      });

      setToastMessage({
        type: 'success',
        text: `Transaction of ${formatInr(amount)} (${type === 'DEBIT' ? 'Dr' : 'Cr'}) saved successfully.`,
      });

      setTimeout(() => navigate('/new-transaction'), 1200);
    } catch {
      setToastMessage({ type: 'error', text: 'Failed to save transaction. Please try again.' });
    }
  }

  function handleCancel() {
    navigate('/new-transaction');
  }

  return (
    <Box sx={{ maxWidth: 1100, pb: 4 }}>
      <PageHeader title="Payment Window(Cr/Dr)" subtitle="Record a donor receipt or programme disbursement" />

      <Card component="form" onSubmit={handleSubmit} noValidate sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4, md: 4.5 } }}>
          <Stack spacing={4}>
            <section>
              <Typography variant="h4" component="h2" sx={{ mb: 3.5, fontWeight: 700 }}>
                Transaction Basics
              </Typography>

              <Grid container rowSpacing={3.25} columnSpacing={3}>
                <Grid size={{ xs: 12 }}>
                  <Tabs
                    value={type}
                    onChange={handleTypeChange}
                    variant="fullWidth"
                    sx={{
                      minHeight: 48,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      '& .MuiTabs-indicator': {
                        height: 3,
                        bgcolor: type === 'DEBIT' ? 'error.main' : 'success.main',
                      },
                    }}
                  >
                    {TRANSACTION_TYPES.map((t) => (
                      <Tab
                        key={t.value}
                        value={t.value}
                        label={t.label}
                        sx={{
                          fontWeight: 600,
                          '&.Mui-selected': {
                            color: t.value === 'DEBIT' ? 'error.main' : 'success.main',
                          },
                        }}
                      />
                    ))}
                  </Tabs>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <SearchableSelect
                    label="Book *"
                    options={BOOKS}
                    value={BOOKS.find((o) => o.value === book) || null}
                    onChange={(newValue) => setBook(newValue?.value || '')}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date *"
                    InputLabelProps={{ shrink: true }}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </Grid>
              </Grid>
            </section>

            <section>
              <Typography variant="h4" component="h2" sx={{ mb: 3.5, fontWeight: 700 }}>
                Party
              </Typography>

              <Grid container rowSpacing={3.25} columnSpacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <SearchableSelect
                    label={isCredit ? 'Donor type *' : 'Payee category *'}
                    options={categoryOptions}
                    value={categoryOptions.find((o) => o.value === category) || null}
                    onChange={handleCategoryChange}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <SearchableSelect
                    label={isCredit ? 'Donor *' : 'Payee *'}
                    options={partyOptions}
                    value={partyOptions.find((o) => o.value === partyId) || null}
                    onChange={handlePartyChange}
                  />
                </Grid>
              </Grid>
            </section>

            <section>
              <Typography variant="h4" component="h2" sx={{ mb: 3.5, fontWeight: 700 }}>
                Fund &amp; Grant
              </Typography>

              <Grid container rowSpacing={3.25} columnSpacing={3}>
                <Grid size={{ xs: 12 }}>
                  <SearchableSelect
                    label="Donor *"
                    options={donorOptions}
                    value={donorOptions.find((o) => o.value === donorId) || null}
                    onChange={handleDonorChange}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <SearchableSelect
                    label="Fund profile *"
                    options={fundOptions}
                    value={fundOptions.find((o) => o.value === fundId) || null}
                    onChange={handleFundChange}
                    disabled={fundOptions.length === 0}
                    placeholder={!donorId ? 'Select donor first' : undefined}
                  />
                  <Typography
                    variant="caption"
                    sx={{ mt: 0.75, display: 'block', color: insufficientBalance ? 'error.main' : 'text.secondary' }}
                  >
                    {currentFund
                      ? currentFund.balance != null
                        ? `Available: ${formatInr(currentFund.balance)}${
                            amount
                              ? ` → After this ${type === 'DEBIT' ? 'debit' : 'credit'}: ${formatInr(projectedBalance)}`
                              : ''
                          }`
                        : 'Balance not available for this fund profile'
                      : 'Select a fund to see available balance'}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <SearchableSelect
                    label="Grant agreement"
                    options={grantOptions}
                    value={grantOptions.find((o) => o.value === grantId) || null}
                    onChange={(newValue) => setGrantId(newValue?.value || '')}
                    disabled={grantOptions.length === 0}
                    placeholder={!fundId ? 'Select fund first' : undefined}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Amount (₹) *"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    error={insufficientBalance}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <SearchableSelect
                    label="Bank account"
                    options={BANK_ACCOUNTS}
                    value={BANK_ACCOUNTS.find((o) => o.value === bankAccount) || null}
                    onChange={(newValue) => setBankAccount(newValue?.value || '')}
                  />
                </Grid>
              </Grid>
            </section>

            <section>
              <Typography variant="h4" component="h2" sx={{ mb: 3.5, fontWeight: 700 }}>
                Payment Details
              </Typography>

              <Grid container rowSpacing={3.25} columnSpacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <SearchableSelect
                    label="Payment mode *"
                    options={paymentModeOptions}
                    value={paymentModeOptions.find((o) => o.value === paymentMode) || null}
                    onChange={(newValue) => setPaymentMode(newValue?.value || '')}
                    disabled={paymentModeOptions.length === 0}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Reference no."
                    placeholder="Txn no. / Cheque no."
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <SearchableSelect
                    label="Group *"
                    options={groupOptions}
                    value={groupOptions.find((o) => o.value === group) || null}
                    onChange={handleGroupChange}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <SearchableSelect
                    label="Ledger / payment type"
                    options={ledgerOptions}
                    value={ledgerOptions.find((o) => o.value === ledgerType) || null}
                    onChange={(newValue) => setLedgerType(newValue?.value || '')}
                    disabled={ledgerOptions.length === 0}
                  />
                </Grid>
              </Grid>
            </section>

            <section>
              <Typography variant="h4" component="h2" sx={{ mb: 3.5, fontWeight: 700 }}>
                Notes &amp; Attachment
              </Typography>

              <Grid container rowSpacing={3.25} columnSpacing={3}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="Note / remarks"
                    placeholder="Optional context for this transaction"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Button component="label" variant="outlined" sx={{ borderStyle: 'dashed' }}>
                    + Attach receipt (PDF, JPG, PNG)
                    <input hidden type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
                  </Button>
                  {attachment ? (
                    <Typography variant="caption" sx={{ mt: 0.75, display: 'block', color: 'text.secondary' }}>
                      Attached: {attachment.name}
                    </Typography>
                  ) : null}
                </Grid>
              </Grid>
            </section>

            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 3 }}>
              <Button variant="outlined" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={createTransaction.isPending}
                sx={{
                  bgcolor: '#17191C',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  px: 3,
                  '&:hover': { bgcolor: '#232629' },
                }}
              >
                {createTransaction.isPending ? 'Saving…' : 'Save Transaction'}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={4000}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toastMessage ? (
          <Alert
            severity={toastMessage.type}
            onClose={() => setToastMessage(null)}
            sx={{ width: '100%', boxShadow: 3 }}
          >
            {toastMessage.text}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}
