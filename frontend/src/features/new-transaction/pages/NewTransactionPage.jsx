import { useEffect, useMemo, useState } from 'react';
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
import { useGrantByFundProfileId } from '../../donor-management/hooks/useGrants.js';
import { deriveDisbursementType } from '../../donor-management/lib/disbursement.js';
import { donorTypeService } from '../../donor-management/services/donorTypeService.js';
import { useCreateTransaction } from '../hooks/useTransactions.js';
import { useInflowBudgetLine, useInflowBudgetLines } from '../../inflow-budget/hooks/useInflowBudget.js';
import { useBankDetails } from '../../bank-details/hooks/useBankDetails.js';
import { BOOKS, PAYEE_CATEGORIES, PAYEES, TRANSACTION_TYPES } from '../data/mockNewTransaction.js';

export function NewTransactionPage() {
  const navigate = useNavigate();
  const [type, setType] = useState('DEBIT');
  const [book, setBook] = useState('LC');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('EMPLOYEE');
  const [partyId, setPartyId] = useState('');
  const [donorId, setDonorId] = useState('');
  const [fundId, setFundId] = useState('');
  const [trancheId, setTrancheId] = useState('');
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

  // Donor type is a manageable master (see Master Configuration → Donor Type)
  // — load the active ones instead of a hardcoded list.
  const [donorTypes, setDonorTypes] = useState([]);
  useEffect(() => {
    donorTypeService
      .listActiveDonorTypes()
      .then(setDonorTypes)
      .catch((err) => console.error('Error loading donor types', err));
  }, []);
  const donorTypeOptions = useMemo(
    () => donorTypes.map((dt) => ({ value: dt.id, label: dt.name })),
    [donorTypes]
  );

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

  // Bank Details master — each statutory account is booked LC or FC, so only
  // offer accounts matching the transaction's own Book.
  const bankDetailsQuery = useBankDetails();
  const bankAccountOptions = useMemo(
    () =>
      (bankDetailsQuery.data || [])
        .filter((b) => b.status === 'ACTIVE' && b.book === book)
        .map((b) => ({
          value: b.id,
          label: `${b.bankName} — ****${String(b.accountNumber).slice(-4)}`,
        })),
    [bankDetailsQuery.data, book]
  );

  const categoryOptions = isCredit ? donorTypeOptions : PAYEE_CATEGORIES;

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

  // A donor is booked as LC (local) or FC (foreign) contribution — a Credit
  // receipt against a given Book should only offer donors booked the same way.
  const partyOptions = useMemo(() => {
    if (!isCredit) {
      return PAYEES.filter((p) => p.category === category).map((p) => ({ value: p.id, label: p.name }));
    }
    return donors
      .filter((d) => String(d.donorTypeId) === String(category) && d.book === book)
      .map((d) => ({ value: d.id, label: d.donorName }));
  }, [isCredit, category, donors, book]);

  // The donor whose fund is being credited or debited — kept separate from the
  // Payee/Donor party field so a Debit (expense) can still be charged to a
  // specific donor's restricted fund.
  const donorOptions = useMemo(
    () => donors.filter((d) => d.book === book).map((d) => ({ value: d.id, label: d.donorName })),
    [donors, book]
  );

  const fundProfilesQuery = useFundProfilesByDonor(donorId || undefined);

  // A fund profile's "unallocatedAmount" is a budget-planning figure (total
  // committed minus what's been scheduled across tranches) — it's usually
  // ₹0 once the schedule is fully planned, so it's the wrong number for
  // "how much is still owed from the donor". The Inflow Budget line for each
  // tranche criterion tracks what's actually been received, so the true
  // outstanding balance is the sum of (expected − received) across the
  // fund's tranche criteria.
  const inflowLinesQuery = useInflowBudgetLines();
  const inflowLinesById = useMemo(() => {
    const map = new Map();
    (inflowLinesQuery.data || []).forEach((line) => map.set(Number(line.id), line));
    return map;
  }, [inflowLinesQuery.data]);

  const fundOptions = useMemo(() => {
    return (fundProfilesQuery.data || []).map((f) => {
      const trancheIds = (f.disbursementRules || [])
        .flatMap((r) => (r.trancheCriteria || []).map((t) => t.id))
        .filter((id) => id != null);
      let balance = null;
      if (trancheIds.length) {
        balance = trancheIds.reduce((sum, id) => {
          const line = inflowLinesById.get(Number(id));
          if (!line) return sum;
          const expected = Number(line.expectedAmount) || 0;
          const received = Number(line.actualAmount) || 0;
          return sum + Math.max(expected - received, 0);
        }, 0);
      }
      return {
        value: f.id,
        label: f.purpose || `${f.fundClassLabel || 'Fund profile'} · #${f.id}`,
        balance,
      };
    });
  }, [fundProfilesQuery.data, inflowLinesById]);

  const currentFund = useMemo(
    () => fundOptions.find((f) => f.value === fundId) || null,
    [fundOptions, fundId]
  );

  // A fund profile backs at most one grant agreement — fetch and auto-fill it
  // read-only rather than making the user pick among options.
  const grantQuery = useGrantByFundProfileId(fundId || undefined);
  const assignedGrant = grantQuery.data || null;
  const grantId = assignedGrant?.id ?? '';

  // Disbursement type/tranches are configured on the fund profile's
  // disbursement rule, not chosen per-transaction — once the assigned grant
  // agreement is known we show that inherited type, and for TRANCHES let the
  // user record which tranche this receipt is against.
  const currentFundProfile = useMemo(
    () => (fundProfilesQuery.data || []).find((f) => f.id === fundId) || null,
    [fundProfilesQuery.data, fundId]
  );
  const disbursementRule = currentFundProfile?.disbursementRules?.[0] || null;
  const disbursementTypeLabel = assignedGrant ? deriveDisbursementType(disbursementRule) : '';
  const isTranched = disbursementTypeLabel === 'Tranches';
  // A Lump Sum rule still has exactly one tranche criterion behind it — the
  // Inflow Budget line the whole committed amount is receipted against. There's
  // no tranche picker for it, but the transaction still needs to post to it,
  // otherwise the fund's balance never reflects what's actually been received.
  const lumpSumCriterionId =
    disbursementTypeLabel === 'Lump Sum' ? disbursementRule?.trancheCriteria?.[0]?.id ?? null : null;
  const trancheOptions = useMemo(() => {
    if (!isTranched) return [];
    return (disbursementRule?.trancheCriteria || []).map((t, i) => ({
      value: t.id ?? i,
      label: `Tranche ${i + 1}${t.isFinalTranche ? ' (final)' : ''} — ${formatInr(t.amountCriteria)}`,
    }));
  }, [isTranched, disbursementRule]);

  // What's still owed against the selected tranche (or, for a lump sum, the
  // fund's unallocated balance) — the Amount field is checked against this
  // rather than accepting whatever the user types.
  const selectedTranche = useMemo(() => {
    if (!isTranched) return null;
    return (disbursementRule?.trancheCriteria || []).find((t, i) => (t.id ?? i) === trancheId) || null;
  }, [isTranched, disbursementRule, trancheId]);

  // The tranche's committed amount (amountCriteria) is what's expected in
  // total — it doesn't account for amounts already received against it. The
  // Inflow Budget line for the same tranche criterion tracks that actual
  // receipt, so the true outstanding balance is expected minus already received.
  const inflowLineQuery = useInflowBudgetLine(isTranched && trancheId !== '' ? trancheId : undefined);

  const outstandingAmount = useMemo(() => {
    if (isTranched) {
      const line = inflowLineQuery.data;
      if (line) {
        const expected = Number(line.expectedAmount) || 0;
        const received = Number(line.actualAmount) || 0;
        return Math.max(expected - received, 0);
      }
      // Fall back to the tranche's full committed amount while the line is loading.
      return selectedTranche ? Number(selectedTranche.amountCriteria) || 0 : null;
    }
    if (disbursementTypeLabel === 'Lump Sum') {
      return currentFund?.balance != null ? Number(currentFund.balance) : null;
    }
    return null;
  }, [isTranched, selectedTranche, inflowLineQuery.data, disbursementTypeLabel, currentFund]);

  const amountExceedsOutstanding =
    outstandingAmount != null && Number(amount) > outstandingAmount;
  // Live remaining balance as the user types, rather than the static
  // outstanding amount — updates on every keystroke.
  const remainingAfterAmount = outstandingAmount != null ? Math.max(outstandingAmount - (Number(amount) || 0), 0) : null;
  const fullAmountReceived =
    outstandingAmount != null && Number(amount) > 0 && Number(amount) === outstandingAmount;

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
    const nextCategory = newType === 'CREDIT' ? (donorTypeOptions[0]?.value ?? '') : PAYEE_CATEGORIES[0].value;
    setCategory(nextCategory);
    setPartyId('');
    setDonorId('');
    setFundId('');
    setTrancheId('');
    setGroup('');
    setLedgerType('');
  }

  function handleBookChange(newValue) {
    setBook(newValue?.value || '');
    // Donor/party and bank account options are booked LC or FC — switching
    // the book invalidates whichever book-dependent selections were already made.
    setPartyId('');
    setDonorId('');
    setFundId('');
    setTrancheId('');
    setBankAccount('');
  }

  function handleGroupChange(newValue) {
    setGroup(newValue?.value || '');
    setLedgerType('');
  }

  function handleCategoryChange(newValue) {
    setCategory(newValue?.value || '');
    setPartyId('');
    setFundId('');
    setTrancheId('');
  }

  function handlePartyChange(newValue) {
    const newPartyId = newValue?.value || '';
    setPartyId(newPartyId);
    // For a Credit, the payee field IS the donor — keep the Donor field in sync.
    if (isCredit) {
      setDonorId(newPartyId);
      setFundId('');
      setTrancheId('');
    }
  }

  function handleDonorChange(newValue) {
    const newDonorId = newValue?.value || '';
    setDonorId(newDonorId);
    if (isCredit) {
      setPartyId(newDonorId);
    }
    setFundId('');
    setTrancheId('');
  }

  function handleFundChange(newValue) {
    setFundId(newValue?.value || '');
    setTrancheId('');
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

    if (isTranched && !trancheId) {
      setToastMessage({ type: 'error', text: 'Please select which tranche this receipt is against.' });
      return;
    }

    if (amountExceedsOutstanding) {
      setToastMessage({
        type: 'error',
        text: `Amount exceeds the outstanding ${formatInr(outstandingAmount)} for this ${
          isTranched ? 'tranche' : 'lump sum'
        }.`,
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
        trancheId: isTranched ? trancheId : lumpSumCriterionId,
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
                    onChange={handleBookChange}
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
                  <TextField
                    fullWidth
                    label="Grant agreement"
                    value={
                      assignedGrant ? assignedGrant.grantCode : fundId && !grantQuery.isPending ? 'No grant agreement yet' : ''
                    }
                    disabled
                    slotProps={{ inputLabel: { shrink: true } }}
                    helperText={!fundId ? 'Select a fund profile first' : 'Inherited from the fund profile'}
                  />
                </Grid>

                {grantId ? (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label="Disbursement type"
                      value={disbursementTypeLabel}
                      disabled
                    />
                  </Grid>
                ) : null}

                {isTranched ? (
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <SearchableSelect
                      label="Tranche *"
                      options={trancheOptions}
                      value={trancheOptions.find((o) => o.value === trancheId) || null}
                      onChange={(newValue) => setTrancheId(newValue?.value || '')}
                      disabled={trancheOptions.length === 0}
                      placeholder={trancheOptions.length === 0 ? 'No tranches configured' : undefined}
                    />
                  </Grid>
                ) : null}

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Amount (₹) *"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    error={insufficientBalance || amountExceedsOutstanding}
                  />
                  {outstandingAmount != null ? (
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 0.75,
                        display: 'block',
                        color: amountExceedsOutstanding
                          ? 'error.main'
                          : fullAmountReceived
                          ? 'success.main'
                          : 'text.secondary',
                      }}
                    >
                      {fullAmountReceived
                        ? `Full amount received for this ${isTranched ? 'tranche' : 'lump sum'}.`
                        : `Outstanding amount: ${formatInr(outstandingAmount)}${
                            Number(amount) > 0 ? ` → After this receipt: ${formatInr(remainingAfterAmount)}` : ''
                          }`}
                    </Typography>
                  ) : null}
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <SearchableSelect
                    label="Bank account"
                    options={bankAccountOptions}
                    value={bankAccountOptions.find((o) => o.value === bankAccount) || null}
                    onChange={(newValue) => setBankAccount(newValue?.value || '')}
                    disabled={bankAccountOptions.length === 0}
                    placeholder={bankAccountOptions.length === 0 ? `No active ${book} accounts` : undefined}
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
