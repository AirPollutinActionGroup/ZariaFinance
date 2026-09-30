import { useMemo, useState } from 'react';
import { Alert, Box, Button, Chip, Grid, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../core/auth/index.js';
import { PageHeader } from '../../../shared/components/index.js';
import { SearchableSelect } from '../../../components/SearchableSelect.jsx';
import { formatInr, formatInrExact } from '../../../lib/format/currency.js';
import { usePaymentModes } from '../../payment-mode/hooks/usePaymentModes.js';
import { usePaymentTypeGroups } from '../../payment-type/hooks/usePaymentTypeGroups.js';
import { usePaymentTypeLedgers } from '../../payment-type/hooks/usePaymentTypeLedgers.js';
import { useBankDetails } from '../../bank-details/hooks/useBankDetails.js';
import { useDonors } from '../../donor-management/hooks/useDonors.js';
import { useFundProfilesByDonor } from '../../donor-management/hooks/useFundProfiles.js';
import { useGrantByFundProfileId } from '../../donor-management/hooks/useGrants.js';
import { BOOKS, donorBook } from '../../donor-management/lib/donorBook.js';
import { deriveDisbursementType } from '../../donor-management/lib/disbursement.js';
import { useInflowBudgetLines } from '../../inflow-budget/hooks/useInflowBudget.js';
import { computeGrantBalance } from '../../debit-notes/lib/grantBalance.js';
import { useDebitNotes } from '../../debit-notes/hooks/useDebitNotes.js';
import { useCreateCreditNote, useCreditNotes } from '../hooks/useCreditNotes.js';
import { FormSection, Figure, MONEY_SX } from '../components/NoteLayout.jsx';
import { BankAccountDetails } from '../components/BankAccountDetails.jsx';
import { ATTACHMENT_ACCEPT, ATTACHMENT_MAX_BYTES } from '../constants.js';

const MAX_MB = ATTACHMENT_MAX_BYTES / (1024 * 1024);
const todayLocal = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time

/** Field → label, for the "still needed" summary. */
const FIELD_LABELS = {
  date: 'Date',
  amount: 'Amount',
  book: 'Book',
  paymentModeId: 'Received via',
  fundId: 'Fund profile',
  trancheId: 'Tranche',
};

function initialForm() {
  return {
    date: todayLocal(),
    amount: '',
    book: 'LC',
    paymentModeId: '',
    bankAccountId: '',
    groupId: '',
    ledgerId: '',
    donorId: '',
    fundId: '',
    trancheId: '',
    reference: '',
    remarks: '',
    file: null,
  };
}

/** { value, label } option → the { id, name } snapshot stored on the note. */
const snapshot = (options, value) => {
  const opt = options.find((o) => o.value === value);
  return opt ? { id: opt.value, name: opt.label } : null;
};

/** Available balance on the chosen fund profile, and what it will be once this credit is returned to it. */
function FundBalanceStrip({ balance, thisNote, loading, failed }) {
  const after = balance.available + thisNote;
  const received = balance.total ? Math.min(100, (balance.received / balance.total) * 100) : 0;
  const money = (v) => (loading ? '…' : v < 0 ? `−${formatInrExact(-v)}` : formatInrExact(v));
  return (
    <Box sx={{ px: 2, py: 1.5, borderRadius: 2, bgcolor: 'var(--card2)', border: '1px solid', borderColor: 'divider' }}>
      {failed ? (
        <Typography variant="caption" color="text.secondary">
          Couldn&apos;t load receipts for this fund, so the available balance can&apos;t be shown.
        </Typography>
      ) : (
        <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(6, minmax(0, 1fr))' }, gap: 2 }}>
            <Figure label="Grant total" value={loading ? '…' : balance.total != null ? formatInrExact(balance.total) : '—'} />
            <Figure label="Received" value={money(balance.received)} color="success.main" />
            <Figure label="Debited" value={balance.debited ? `− ${money(balance.debited)}` : money(0)} color={balance.debited ? 'error.main' : undefined} />
            <Figure label="Received via credit notes" value={money(balance.credited)} color={balance.credited ? 'success.main' : undefined} />
            <Figure label="Balance available" strong value={money(balance.available)} color={balance.available < 0 ? 'error.main' : 'text.primary'} />
            <Figure label="After this credit" strong value={money(after)} color="success.main" />
          </Box>
          {balance.total ? (
            <Box sx={{ mt: 1.25, height: 6, borderRadius: 3, bgcolor: 'var(--line2)', overflow: 'hidden' }}>
              <Box sx={{ height: '100%', width: `${received}%`, bgcolor: 'success.main', borderRadius: 3 }} />
            </Box>
          ) : null}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
            {!balance.hasReceipts
              ? balance.hasTranches
                ? 'Nothing received on this fund yet.'
                : 'This fund profile has no tranche plan and no receipts yet.'
              : balance.total
                ? `${Math.round(received)}% of the grant received so far. This credit goes back to the fund's available balance.`
                : 'No grant agreement yet — balance is based on receipts only.'}
          </Typography>
        </>
      )}
    </Box>
  );
}

/**
 * Raise a credit note — /credit-notes/new. Records money that came back —
 * a refund, a rebate — optionally returned to a donor fund.
 */
export function CreditNoteCreatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Debit notes aren't shown here, but the fund's available balance nets them off.
  const debitNotesQuery = useDebitNotes();
  const creditNotesQuery = useCreditNotes();
  const debitNotes = useMemo(() => debitNotesQuery.data || [], [debitNotesQuery.data]);
  const creditNotes = useMemo(() => creditNotesQuery.data || [], [creditNotesQuery.data]);
  const createNote = useCreateCreditNote();

  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  // Fields the user has left — their errors show straight away, before submit.
  const [touched, setTouched] = useState({});
  const touch = (field) => () => setTouched((t) => (t[field] ? t : { ...t, [field]: true }));
  const [saveError, setSaveError] = useState(null);
  const [fileError, setFileError] = useState(null);

  const setValue = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const set = (field) => (e) => setValue(field, e.target.value);

  // ── Master data (server-backed) ─────────────────────────────────────────
  const paymentModesQuery = usePaymentModes();
  const paymentModeOptions = useMemo(
    () => (paymentModesQuery.data || []).filter((m) => m.status === 'ACTIVE').map((m) => ({ value: m.id, label: m.name })),
    [paymentModesQuery.data],
  );

  const groupsQuery = usePaymentTypeGroups();
  const groupOptions = useMemo(
    () => (groupsQuery.data || []).filter((g) => g.status === 'ACTIVE').map((g) => ({ value: g.id, label: g.name })),
    [groupsQuery.data],
  );

  const ledgersQuery = usePaymentTypeLedgers();
  const ledgerOptions = useMemo(
    () =>
      (ledgersQuery.data || [])
        .filter((l) => l.status === 'ACTIVE' && l.groupId === form.groupId)
        .map((l) => ({ value: l.id, label: l.name })),
    [ledgersQuery.data, form.groupId],
  );

  // Money is received into an account booked the same (LC / FC) as the note.
  const bankDetailsQuery = useBankDetails();
  const bankAccountOptions = useMemo(
    () =>
      (bankDetailsQuery.data || [])
        .filter((b) => b.status === 'ACTIVE' && b.book === form.book)
        .map((b) => ({ value: b.id, label: `${b.bankName} — ****${String(b.accountNumber).slice(-4)}` })),
    [bankDetailsQuery.data, form.book],
  );
  // The picked account's full record (IFSC, branch) from the same backend list.
  const selectedBankAccount = (bankDetailsQuery.data || []).find((b) => b.id === form.bankAccountId) || null;

  // ── Fund & Grant ────────────────────────────────────────────────────────
  const donorsQuery = useDonors();
  const donors = useMemo(() => donorsQuery.data || [], [donorsQuery.data]);
  const donorOptions = useMemo(
    () => donors.filter((d) => donorBook(d) === form.book).map((d) => ({ value: d.id, label: d.donorName })),
    [donors, form.book],
  );
  const fundProfilesQuery = useFundProfilesByDonor(form.donorId || undefined);
  const fundOptions = useMemo(
    () =>
      (fundProfilesQuery.data || []).map((f) => ({
        value: f.id,
        label: f.purpose || `${f.fundClassLabel || 'Fund profile'} · #${f.id}`,
      })),
    [fundProfilesQuery.data],
  );
  const grantQuery = useGrantByFundProfileId(form.fundId || undefined);
  const assignedGrant = form.fundId ? grantQuery.data || null : null;

  // Disbursement type is configured on the fund profile's disbursement rule, not picked here.
  const currentFundProfile = (fundProfilesQuery.data || []).find((f) => f.id === form.fundId) || null;
  const disbursementRule = currentFundProfile?.disbursementRules?.[0] || null;
  const disbursementTypeLabel = currentFundProfile ? deriveDisbursementType(disbursementRule) : '';
  const isTranched = disbursementTypeLabel === 'Tranches';
  // A tranched fund needs the tranche this money goes back to.
  const trancheOptions = isTranched
    ? (disbursementRule?.trancheCriteria || []).map((t, i) => ({
        value: t.id ?? i,
        label: `Tranche ${i + 1}${t.isFinalTranche ? ' (final)' : ''} — ${formatInrExact(t.amountCriteria)}`,
      }))
    : [];

  // Balance available = received on the fund (Inflow Budget, incl. credit notes) − debit notes.
  const inflowLinesQuery = useInflowBudgetLines();
  const inflowLinesById = useMemo(() => {
    const map = new Map();
    (inflowLinesQuery.data || []).forEach((line) => map.set(Number(line.id), line));
    return map;
  }, [inflowLinesQuery.data]);
  // Still owed from the donor: expected − received on the
  // selected tranche's Inflow Budget line, or across all the fund's criteria for a lump sum.
  const owedOn = (criterionId) => {
    const line = inflowLinesById.get(Number(criterionId));
    return line ? Math.max((Number(line.expectedAmount) || 0) - (Number(line.actualAmount) || 0), 0) : null;
  };
  let outstandingAmount = null;
  if (isTranched && form.trancheId !== '') {
    const tranche = (disbursementRule?.trancheCriteria || []).find((t, i) => (t.id ?? i) === form.trancheId);
    // Fall back to the tranche's committed amount while its Inflow line is loading.
    outstandingAmount = owedOn(form.trancheId) ?? (tranche ? Number(tranche.amountCriteria) || 0 : null);
  } else if (disbursementTypeLabel === 'Lump Sum') {
    const owed = (disbursementRule?.trancheCriteria || []).map((t) => (t.id != null ? owedOn(t.id) : null)).filter((v) => v != null);
    outstandingAmount = owed.length ? owed.reduce((s, v) => s + v, 0) : null;
  }

  const fundBalance = currentFundProfile
    ? computeGrantBalance({
        fundProfile: currentFundProfile,
        grant: assignedGrant,
        inflowLinesById,
        notes: debitNotes,
        credits: creditNotes,
      })
    : null;

  // ── Figures & validation ────────────────────────────────────────────────
  const amount = Number(form.amount);
  const thisNote = amount > 0 ? amount : 0;
  const exceedsOutstanding = outstandingAmount != null && thisNote > outstandingAmount;
  const fullOutstanding = outstandingAmount != null && thisNote > 0 && thisNote === outstandingAmount;
  const outstandingText =
    outstandingAmount == null
      ? ''
      : fullOutstanding
        ? `Full amount received for this ${isTranched ? 'tranche' : 'lump sum'}.`
        : `Outstanding amount: ${formatInr(outstandingAmount)}${
            thisNote ? ` → After this receipt: ${formatInr(Math.max(outstandingAmount - thisNote, 0))}` : ''
          }`;

  const errors = {
    date: form.date ? null : 'Required',
    amount: amount > 0 ? null : 'Enter an amount greater than zero',
    book: form.book ? null : 'Required',
    paymentModeId: form.paymentModeId ? null : 'Select how it was received',
    // A fund profile belongs to a donor — can't pick one without the other.
    fundId: !form.donorId || form.fundId ? null : 'Select the fund profile for this donor',
    trancheId: !isTranched || form.trancheId !== '' ? null : 'Select the tranche',
  };
  const isValid = Object.values(errors).every((e) => !e);
  const show = (field) => (submitted || touched[field] ? errors[field] : null);
  const missing = Object.keys(errors).filter((k) => errors[k]).map((k) => FIELD_LABELS[k]);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleBookChange = (opt) =>
    setForm((f) => ({ ...f, book: opt?.value || '', bankAccountId: '', donorId: '', fundId: '', trancheId: '' }));
  const handleDonorChange = (opt) => setForm((f) => ({ ...f, donorId: opt?.value || '', fundId: '', trancheId: '' }));
  const handleFundChange = (opt) => setForm((f) => ({ ...f, fundId: opt?.value || '', trancheId: '' }));
  const handleGroupChange = (opt) => setForm((f) => ({ ...f, groupId: opt?.value || '', ledgerId: '' }));

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    e.target.value = ''; // allow re-picking the same file after removing it
    if (!file) return;
    if (file.size > ATTACHMENT_MAX_BYTES) {
      setFileError(`File is larger than ${MAX_MB} MB`);
      return;
    }
    setFileError(null);
    setValue('file', file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setSaveError(null);
    if (!isValid) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    try {
      const note = await createNote.mutateAsync({
        actor: user?.name || 'You',
        input: {
          date: form.date,
          amount,
          book: form.book,
          paymentMode: snapshot(paymentModeOptions, form.paymentModeId),
          bankAccount: snapshot(bankAccountOptions, form.bankAccountId),
          group: snapshot(groupOptions, form.groupId),
          ledger: snapshot(ledgerOptions, form.ledgerId),
          donor: snapshot(donorOptions, form.donorId),
          fundProfile: snapshot(fundOptions, form.fundId),
          grant: assignedGrant ? { id: assignedGrant.id, name: assignedGrant.grantCode } : null,
          disbursementType: disbursementTypeLabel || null,
          tranche: isTranched ? snapshot(trancheOptions, form.trancheId) : null,
          reference: form.reference,
          remarks: form.remarks,
          // Only the file name is saved for now — there's no file upload service yet.
          attachment: form.file ? { name: form.file.name } : null,
        },
      });
      navigate(`/credit-notes/${note.id}`, { state: { justIssued: true } });
    } catch (err) {
      setSaveError(err.message || 'Could not issue the credit note.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const backTo = '/credit-notes';
  const mastersFailed = paymentModesQuery.isError || groupsQuery.isError || bankDetailsQuery.isError || donorsQuery.isError;

  return (
    <Box>
      <PageHeader
        title="New Credit Note"
        subtitle="Record money that came back — a refund, an overcharge reversed, a rebate."
        actions={
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(backTo)}>
            Back to List
          </Button>
        }
      />

      {mastersFailed ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Could not load donors, payment modes, groups or bank accounts from the server. Check the connection and reload this page.
        </Alert>
      ) : null}
      {submitted && !isValid ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Still needed: {missing.join(', ')}.
        </Alert>
      ) : null}
      {saveError ? <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert> : null}

      <form onSubmit={handleSubmit} noValidate>
        <FormSection
          number="01"
          icon={AccountBalanceWalletOutlinedIcon}
          title="Date & Book"
          description="When the money came back, and which book it's recorded in."
        >
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              required
              type="date"
              label="Date received"
              value={form.date}
              onChange={set('date')}
              error={Boolean(show('date'))}
              helperText={show('date') || ' '}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SearchableSelect
              label="Book *"
              options={BOOKS}
              value={BOOKS.find((o) => o.value === form.book) || null}
              onChange={handleBookChange}
              error={show('book')}
            />
          </Grid>
        </FormSection>

        <FormSection
          number="02"
          icon={VolunteerActivismOutlinedIcon}
          title="Fund & Grant"
          description="How much came back, and (optionally) the donor fund it goes back to."
        >
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <SearchableSelect
              label="Donor"
              options={donorOptions}
              value={donorOptions.find((o) => o.value === form.donorId) || null}
              onChange={handleDonorChange}
              loading={donorsQuery.isLoading}
              disabled={!donorsQuery.isLoading && donorOptions.length === 0}
              placeholder={!donorsQuery.isLoading && donorOptions.length === 0 ? `No ${form.book} donors` : undefined}
              error={show('donorId')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <SearchableSelect
              label={form.donorId ? 'Fund profile *' : 'Fund profile'}
              options={fundOptions}
              value={fundOptions.find((o) => o.value === form.fundId) || null}
              onChange={handleFundChange}
              loading={Boolean(form.donorId) && fundProfilesQuery.isLoading}
              disabled={!form.donorId || (!fundProfilesQuery.isLoading && fundOptions.length === 0)}
              placeholder={
                !form.donorId ? 'Select donor first' : !fundProfilesQuery.isLoading && fundOptions.length === 0 ? 'No fund profiles for this donor' : undefined
              }
              error={show('fundId')}
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: -1, ...MONEY_SX }}>
              {!fundBalance
                ? 'Select a fund to see its available balance'
                : inflowLinesQuery.isLoading
                  ? 'Loading balance…'
                  : inflowLinesQuery.isError
                    ? 'Balance not available for this fund profile'
                    : `Available: ${formatInrExact(fundBalance.available)}${thisNote ? ` → after this credit: ${formatInrExact(fundBalance.available + thisNote)}` : ''}`}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Grant agreement"
              value={assignedGrant ? assignedGrant.grantCode : form.fundId && !grantQuery.isPending ? 'No grant agreement yet' : ''}
              disabled
              placeholder="Inherited from the fund profile"
              slotProps={{ inputLabel: { shrink: true } }}
              helperText=" "
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              label="Disbursement type"
              value={disbursementTypeLabel}
              disabled
              placeholder="From the fund profile"
              slotProps={{ inputLabel: { shrink: true } }}
              helperText=" "
            />
          </Grid>
          {isTranched ? (
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <SearchableSelect
                label="Tranche *"
                options={trancheOptions}
                value={trancheOptions.find((o) => o.value === form.trancheId) || null}
                onChange={(opt) => setValue('trancheId', opt ? opt.value : '')}
                disabled={trancheOptions.length === 0}
                placeholder={trancheOptions.length === 0 ? 'No tranches configured' : undefined}
                error={show('trancheId')}
              />
            </Grid>
          ) : null}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              required
              type="number"
              label="Amount"
              value={form.amount}
              onChange={set('amount')}
              onBlur={touch('amount')}
              error={Boolean(show('amount')) || exceedsOutstanding}
              helperText={show('amount') || outstandingText || ' '}
              slotProps={{
                htmlInput: { min: 0, step: 'any' },
                input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> },
                formHelperText: { sx: { ...MONEY_SX, color: !show('amount') && fullOutstanding ? 'success.main' : undefined } },
              }}
            />
          </Grid>
          {fundBalance ? (
            <Grid size={12}>
              <FundBalanceStrip
                balance={fundBalance}
                thisNote={thisNote}
                loading={inflowLinesQuery.isLoading || grantQuery.isLoading}
                failed={inflowLinesQuery.isError}
              />
            </Grid>
          ) : null}
        </FormSection>

        <FormSection number="03" icon={PaymentsOutlinedIcon} title="Receipt Details" description="How the money came back and which account it landed in.">
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <SearchableSelect
              label="Received via *"
              options={paymentModeOptions}
              value={paymentModeOptions.find((o) => o.value === form.paymentModeId) || null}
              onChange={(opt) => setValue('paymentModeId', opt?.value || '')}
              loading={paymentModesQuery.isLoading}
              error={show('paymentModeId')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <SearchableSelect
              label="Into bank account"
              options={bankAccountOptions}
              value={bankAccountOptions.find((o) => o.value === form.bankAccountId) || null}
              onChange={(opt) => setValue('bankAccountId', opt?.value || '')}
              loading={bankDetailsQuery.isLoading}
              disabled={!bankDetailsQuery.isLoading && bankAccountOptions.length === 0}
              placeholder={!bankDetailsQuery.isLoading && bankAccountOptions.length === 0 ? `No active ${form.book} accounts` : undefined}
            />
            {selectedBankAccount ? (
              <Box sx={{ mt: -1 }}>
                <BankAccountDetails record={selectedBankAccount} compact />
              </Box>
            ) : bankDetailsQuery.isSuccess && bankAccountOptions.length === 0 ? (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: -1 }}>
                {(bankDetailsQuery.data || []).length
                  ? `No active ${form.book} accounts — change the Book, or add one in Bank Details.`
                  : 'No bank accounts yet — add them in Bank Details.'}
              </Typography>
            ) : null}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label="Reference no."
              placeholder="Vendor credit memo / UTR"
              value={form.reference}
              onChange={set('reference')}
              helperText=" "
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <SearchableSelect
              label="Group / payment group"
              options={groupOptions}
              value={groupOptions.find((o) => o.value === form.groupId) || null}
              onChange={handleGroupChange}
              loading={groupsQuery.isLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <SearchableSelect
              label="Ledger / payment type"
              options={ledgerOptions}
              value={ledgerOptions.find((o) => o.value === form.ledgerId) || null}
              onChange={(opt) => setValue('ledgerId', opt?.value || '')}
              disabled={!form.groupId || ledgerOptions.length === 0}
              placeholder={form.groupId ? undefined : 'Select a group first'}
            />
          </Grid>
        </FormSection>

        <FormSection
          number="04"
          icon={DescriptionOutlinedIcon}
          title="Notes & Attachment"
          description={`Optional remarks and the vendor's credit memo (PDF, JPG or PNG, up to ${MAX_MB} MB).`}
        >
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField fullWidth multiline minRows={1} maxRows={4} label="Remarks" value={form.remarks} onChange={set('remarks')} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', alignItems: 'center' }}>
            <Stack spacing={0.5} sx={{ width: '100%' }}>
              {form.file ? (
                <Chip
                  variant="outlined"
                  color="success"
                  icon={<CheckCircleIcon />}
                  label={`${form.file.name} · ${Math.max(1, Math.round(form.file.size / 1024))} KB`}
                  onDelete={() => setValue('file', null)}
                  sx={{ fontWeight: 600, py: 2.5, justifyContent: 'flex-start', maxWidth: '100%' }}
                />
              ) : (
                <Chip
                  component="label"
                  clickable
                  variant="outlined"
                  icon={<UploadFileIcon />}
                  label="Attach credit memo"
                  sx={{ fontWeight: 600, py: 2.5, justifyContent: 'flex-start', cursor: 'pointer', maxWidth: '100%' }}
                >
                  <input type="file" hidden accept={ATTACHMENT_ACCEPT} onChange={handleFileChange} />
                </Chip>
              )}
              {fileError ? <Typography variant="caption" color="error">{fileError}</Typography> : null}
            </Stack>
          </Grid>
        </FormSection>

        <Stack direction="row" spacing={2} justifyContent="flex-end" alignItems="center" sx={{ mt: 3 }}>
          {thisNote ? (
            <Typography variant="body2" color="text.secondary" sx={{ mr: 'auto' }}>
              Credit note total{' '}
              <Box component="span" sx={{ ...MONEY_SX, fontWeight: 700, color: 'success.main', fontSize: 16 }}>
                {formatInrExact(thisNote)}
              </Box>
            </Typography>
          ) : null}
          <Button variant="outlined" size="large" onClick={() => navigate(backTo)} sx={{ px: 3, fontWeight: 700 }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="success"
            size="large"
            startIcon={<SaveIcon />}
            disabled={createNote.isPending}
            sx={{ px: 4, fontWeight: 700, borderRadius: 2 }}
          >
            {createNote.isPending ? 'Issuing…' : 'Issue Credit Note'}
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
