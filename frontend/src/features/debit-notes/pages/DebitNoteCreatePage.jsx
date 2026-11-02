import { useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SaveIcon from '@mui/icons-material/Save';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../core/auth/index.js';
import { ErrorState, LoadingState, PageHeader, StatusChip } from '../../../shared/components/index.js';
import { SearchableSelect } from '../../../components/SearchableSelect.jsx';
import { formatInrExact } from '../../../lib/format/currency.js';
import { formatDate } from '../../../lib/format/date.js';
import { useOutflowRows } from '../../outflow-budget/hooks/useOutflow.js';
import { rowRemaining, rowSpent } from '../../outflow-budget/lib/spent.js';
import { BUDGET_TYPE, BUDGET_TYPE_TONE } from '../../budget/constants.js';
import { usePaymentModes } from '../../payment-mode/hooks/usePaymentModes.js';
import { usePaymentTypeGroups } from '../../payment-type/hooks/usePaymentTypeGroups.js';
import { usePaymentTypeLedgers } from '../../payment-type/hooks/usePaymentTypeLedgers.js';
import { useBankDetails } from '../../bank-details/hooks/useBankDetails.js';
import { useDonors } from '../../donor-management/hooks/useDonors.js';
import { useFundProfilesByDonor } from '../../donor-management/hooks/useFundProfiles.js';
import { useGrantByFundProfileId } from '../../donor-management/hooks/useGrants.js';
import { BOOKS, donorBook } from '../../donor-management/lib/donorBook.js';
import { useInflowBudgetLines } from '../../inflow-budget/hooks/useInflowBudget.js';
import { computeGrantBalance } from '../lib/grantBalance.js';
import { useEmployees } from '../../employee-list/hooks/useEmployees.js';
import { useVendors } from '../../vendor-registration/hooks/useVendors.js';
import { useCreateDebitNote, useDebitNotes } from '../hooks/useDebitNotes.js';
import { debitTotalsByLine } from '../lib/debitTotals.js';
import { FundSuggestionDialog } from '../components/FundSuggestionDialog.jsx';
import { useCreditNotes } from '../../credit-notes/hooks/useCreditNotes.js';
import { Figure, FormSection, MONEY_SX } from '../../credit-notes/components/NoteLayout.jsx';
import { ATTACHMENT_ACCEPT, ATTACHMENT_MAX_BYTES, DEBIT_NOTE_REASON, PAYEE_CATEGORIES } from '../constants.js';

const MAX_MB = ATTACHMENT_MAX_BYTES / (1024 * 1024);
/** Employee Master statuses that can still be paid — must match EMPLOYEE_STATUSES verbatim. */
const PAYABLE_EMPLOYEE_STATUSES = ['Active', 'On Notice'];
const todayLocal = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD in local time

/** Field → label, for the "still needed" summary. */
const FIELD_LABELS = {
  line: 'Outflow line',
  date: 'Date',
  amount: 'Amount',
  reason: 'Over-budget reason',
  book: 'Book',
  payeeCategory: 'Payee category',
  payeeId: 'Payee',
  paymentModeId: 'Payment mode',
  groupId: 'Group',
  donorId: 'Donor',
  fundId: 'Fund profile',
};

function initialForm(line) {
  return {
    line,
    date: todayLocal(),
    amount: '',
    reason: '',
    book: line?.book || 'LC',
    payeeCategory: 'VENDOR',
    payeeId: '',
    paymentModeId: '',
    bankAccountId: '',
    groupId: '',
    ledgerId: '',
    donorId: '',
    fundId: '',
    reference: '',
    remarks: '',
    file: null,
  };
}

/** { value, label } option → the { id, name } snapshot stored on the note. */
const snapshot = (options, value) => {
  const opt = options.find((o) => o.value === value);
  return opt ? { id: opt.value, name: opt.name ?? opt.label } : null;
};

/** Available balance on the chosen fund profile, and what's left once this debit is charged to it. */
function FundBalanceStrip({ balance, thisNote, loading, failed }) {
  const after = balance.available - thisNote;
  const short = !loading && after < 0;
  const received = balance.total ? Math.min(100, (balance.received / balance.total) * 100) : 0;
  const money = (v) => (loading ? '…' : v < 0 ? `−${formatInrExact(-v)}` : formatInrExact(v));
  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        borderRadius: 2,
        bgcolor: short ? 'var(--err-bg)' : 'var(--card2)',
        border: '1px solid',
        borderColor: short ? 'error.main' : 'divider',
      }}
    >
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
            <Figure label="After this debit" strong value={money(after)} color={short ? 'error.main' : 'text.primary'} />
          </Box>
          {balance.total ? (
            <Box sx={{ mt: 1.25, height: 6, borderRadius: 3, bgcolor: 'var(--line2)', overflow: 'hidden' }}>
              <Box sx={{ height: '100%', width: `${received}%`, bgcolor: 'success.main', borderRadius: 3 }} />
            </Box>
          ) : null}
          <Typography variant="caption" color={short ? 'error.main' : 'text.secondary'} sx={{ display: 'block', mt: 0.75 }}>
            {short
              ? `This note is ${formatInrExact(-after)} more than the fund has available.`
              : !balance.hasReceipts
                ? balance.hasTranches
                  ? 'Nothing received on this fund yet.'
                  : 'This fund profile has no tranche plan and no receipts yet.'
                : balance.total
                  ? `${Math.round(received)}% of the grant received so far.`
                  : 'No grant agreement yet — balance is based on receipts only.'}
          </Typography>
        </>
      )}
    </Box>
  );
}

/** Compact budget effect for the chosen line: figures + a thin spent / this-note bar. */
function BudgetStrip({ line, spentBefore, thisNote, remainingAfter }) {
  const budget = line.expectedAmount;
  const scale = Math.max(budget, spentBefore + thisNote, 1);
  const pct = (v) => `${Math.max(0, (v / scale) * 100)}%`;
  const over = remainingAfter < 0;
  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        borderRadius: 2,
        bgcolor: over ? 'var(--warn-bg)' : 'var(--card2)',
        border: '1px solid',
        borderColor: over ? 'warning.main' : 'divider',
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 1.25, md: 3 }} alignItems={{ md: 'center' }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
          <StatusChip label={BUDGET_TYPE[line.budgetType]} tone={BUDGET_TYPE_TONE[line.budgetType]} />
          <Typography variant="caption" color="text.secondary">{line.scope} · due {formatDate(line.expectedDate)}</Typography>
        </Stack>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 2, flex: 1 }}>
          <Figure label="Budgeted" value={formatInrExact(budget)} />
          <Figure label="Spent so far" value={formatInrExact(spentBefore)} />
          <Figure label="This note" value={thisNote ? `+ ${formatInrExact(thisNote)}` : '—'} color="error.main" />
          <Figure
            label="Remaining after"
            strong
            value={over ? `−${formatInrExact(-remainingAfter)}` : formatInrExact(remainingAfter)}
            color={over ? 'error.main' : 'success.main'}
          />
        </Box>
      </Stack>
      <Box sx={{ position: 'relative', mt: 1.25, height: 6, borderRadius: 3, bgcolor: 'var(--line2)', overflow: 'hidden', display: 'flex' }}>
        <Box sx={{ width: pct(spentBefore), bgcolor: 'text.secondary', opacity: 0.5 }} />
        <Box sx={{ width: pct(thisNote), bgcolor: 'error.main', transition: 'width .25s ease' }} />
        {over ? <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: pct(budget), width: 2, bgcolor: 'text.primary' }} /> : null}
      </Box>
    </Box>
  );
}

/**
 * Raise a debit note — /debit-notes/new (optionally ?line=BUD-2026-001-BL01-Q2
 * to preselect the outflow row). Waits for the outflow rows and existing notes
 * so the preselected row and its Spent are known before the form starts.
 */
export function DebitNoteCreatePage() {
  const linesQuery = useOutflowRows();
  const debitNotesQuery = useDebitNotes();
  const creditNotesQuery = useCreditNotes();
  const failed = [linesQuery, debitNotesQuery, creditNotesQuery].find((q) => q.isError);

  if (failed) return <ErrorState error={failed.error} onRetry={failed.refetch} />;
  if (linesQuery.isPending || debitNotesQuery.isPending || creditNotesQuery.isPending) {
    return <LoadingState label="Loading outflow lines…" />;
  }
  return <DebitNoteForm lines={linesQuery.data} allNotes={debitNotesQuery.data} allCredits={creditNotesQuery.data} />;
}

/** The form itself. Party, payment mode, bank account and Group ▸ Ledger come from the server-backed master data. */
function DebitNoteForm({ lines, allNotes, allCredits }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const createNote = useCreateDebitNote();
  const debitTotals = useMemo(() => debitTotalsByLine(allNotes), [allNotes]);
  const [form, setForm] = useState(() => initialForm(lines.find((l) => l.id === searchParams.get('line')) || null));
  const [submitted, setSubmitted] = useState(false);
  // Fields the user has left — their errors show straight away, before submit.
  const [touched, setTouched] = useState({});
  const touch = (field) => () => setTouched((t) => (t[field] ? t : { ...t, [field]: true }));
  const [saveError, setSaveError] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [suggestOpen, setSuggestOpen] = useState(false);

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

  // Ledger cascades from the selected Group.
  const ledgersQuery = usePaymentTypeLedgers();
  const ledgerOptions = useMemo(
    () =>
      (ledgersQuery.data || [])
        .filter((l) => l.status === 'ACTIVE' && l.groupId === form.groupId)
        .map((l) => ({ value: l.id, label: l.name })),
    [ledgersQuery.data, form.groupId],
  );

  // Each bank account is booked LC or FC — only offer accounts matching the note's Book.
  const bankDetailsQuery = useBankDetails();
  const bankAccountOptions = useMemo(
    () =>
      (bankDetailsQuery.data || [])
        .filter((b) => b.status === 'ACTIVE' && b.book === form.book)
        .map((b) => ({ value: b.id, label: `${b.bankName} — ****${String(b.accountNumber).slice(-4)}` })),
    [bankDetailsQuery.data, form.book],
  );

  // Payees are the active Employee Master / Vendor Register records (server-backed).
  // An employee on notice is still on the payroll, so can still be paid.
  const employeesQuery = useEmployees();
  const vendorsQuery = useVendors();
  const payeeQuery = form.payeeCategory === 'EMPLOYEE' ? employeesQuery : vendorsQuery;
  const payeeOptions = useMemo(() => {
    if (form.payeeCategory === 'EMPLOYEE') {
      return (employeesQuery.data || [])
        .filter((e) => PAYABLE_EMPLOYEE_STATUSES.includes(e.status))
        .map((e) => ({ value: e.id, name: e.name, label: e.empId ? `${e.name} (${e.empId})` : e.name }));
    }
    if (form.payeeCategory === 'VENDOR') {
      return (vendorsQuery.data || [])
        .filter((v) => v.status === 'Active')
        .map((v) => ({ value: v.id, name: v.legalName, label: v.vendorCode ? `${v.legalName} (${v.vendorCode})` : v.legalName }));
    }
    return [];
  }, [form.payeeCategory, employeesQuery.data, vendorsQuery.data]);
  const payeeNoun = form.payeeCategory === 'EMPLOYEE' ? 'employees' : 'vendors';

  // ── Fund & Grant (server-backed donor-management data) ──
  // A donor is booked LC or FC — only offer donors booked the same as the note.
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

  // A fund profile backs at most one grant agreement — shown read-only, not picked.
  const grantQuery = useGrantByFundProfileId(form.fundId || undefined);
  const assignedGrant = form.fundId ? grantQuery.data || null : null;

  // Available balance on the chosen fund: received on its tranches (Inflow Budget) − debit notes already charged to it.
  const inflowLinesQuery = useInflowBudgetLines();
  const inflowLinesById = useMemo(() => {
    const map = new Map();
    (inflowLinesQuery.data || []).forEach((line) => map.set(Number(line.id), line));
    return map;
  }, [inflowLinesQuery.data]);
  const currentFundProfile = (fundProfilesQuery.data || []).find((f) => f.id === form.fundId) || null;

  const grantBalance = currentFundProfile
    ? computeGrantBalance({
        fundProfile: currentFundProfile,
        grant: assignedGrant,
        inflowLinesById,
        notes: allNotes,
        credits: allCredits,
      })
    : null;


  // ── Validation ──────────────────────────────────────────────────────────
  const amount = Number(form.amount);
  const spentNow = form.line ? rowSpent(form.line, debitTotals) : 0;
  const thisNote = amount > 0 ? amount : 0;
  const remainingAfter = form.line ? rowRemaining(form.line, debitTotals) - thisNote : 0;
  // Reason is only asked for when this note takes the line over budget.
  const isOverBudget = Boolean(form.line) && remainingAfter < 0;
  // A debit charged to a fund can't be for more than the fund has available (the server checks the same).
  const fundAvailable =
    grantBalance && !inflowLinesQuery.isLoading && !inflowLinesQuery.isError ? Math.max(grantBalance.available, 0) : null;
  const amountError =
    amount > 0
      ? fundAvailable != null && amount > fundAvailable
        ? fundAvailable > 0
          ? `Only ${formatInrExact(fundAvailable)} available on this fund`
          : 'No balance available on this fund'
        : null
      : 'Enter an amount greater than zero';

  // Keys in on-page order — the "Still needed" summary lists them this way.
  const errors = {
    date: form.date ? null : 'Required',
    book: form.book ? null : 'Required',
    line: form.line ? null : 'Select an outflow line',
    amount: amountError,
    reason: !isOverBudget || form.reason ? null : 'Over budget — select why',
    payeeCategory: form.payeeCategory ? null : 'Required',
    payeeId: form.payeeId ? null : 'Select a payee',
    paymentModeId: form.paymentModeId ? null : 'Select a payment mode',
    groupId: form.groupId ? null : 'Select a group',
    // Donor / fund are optional, but a donor picked needs its fund profile.
    fundId: form.fundId || !form.donorId ? null : 'Select the fund profile for this donor',
  };
  const isValid = Object.values(errors).every((e) => !e);
  const show = (field) => (submitted || touched[field] ? errors[field] : null);
  const missing = Object.keys(errors).filter((k) => errors[k]).map((k) => FIELD_LABELS[k]);

  // ── Handlers ────────────────────────────────────────────────────────────
  // A new line may change the Book, which clears the book-bound picks (bank account, donor, fund).
  const handleLineChange = (line) =>
    setForm((f) => {
      const book = line?.book || f.book;
      const bookChanged = book !== f.book;
      return {
        ...f,
        line,
        book,
        bankAccountId: bookChanged ? '' : f.bankAccountId,
        donorId: bookChanged ? '' : f.donorId,
        fundId: bookChanged ? '' : f.fundId,
      };
    });
  const handleBookChange = (opt) =>
    setForm((f) => ({ ...f, book: opt?.value || '', bankAccountId: '', donorId: '', fundId: '' }));
  const handleDonorChange = (opt) => setForm((f) => ({ ...f, donorId: opt?.value || '', fundId: '' }));
  const handleFundChange = (opt) => setForm((f) => ({ ...f, fundId: opt?.value || '' }));
  // A suggestion is only applied when the user picks it in the dialog and presses Select.
  const handleSuggestionSelect = (s) => {
    setForm((f) => ({ ...f, donorId: s.donorId, fundId: s.fundProfileId }));
    setTouched((t) => ({ ...t, donorId: true, fundId: true }));
    setSuggestOpen(false);
  };
  const handleCategoryChange = (opt) => setForm((f) => ({ ...f, payeeCategory: opt?.value || '', payeeId: '' }));
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
          outflowLineId: form.line.id,
          date: form.date,
          amount,
          reason: isOverBudget ? form.reason : null, // drop a stale pick if the amount came back within budget
          book: form.book,
          payeeCategory: form.payeeCategory,
          payee: snapshot(payeeOptions, form.payeeId),
          paymentMode: snapshot(paymentModeOptions, form.paymentModeId),
          bankAccount: snapshot(bankAccountOptions, form.bankAccountId),
          group: snapshot(groupOptions, form.groupId),
          ledger: snapshot(ledgerOptions, form.ledgerId),
          donor: snapshot(donorOptions, form.donorId),
          fundProfile: snapshot(fundOptions, form.fundId),
          grant: assignedGrant ? { id: assignedGrant.id, name: assignedGrant.grantCode } : null,
          reference: form.reference,
          remarks: form.remarks,
          // Only the file name is saved for now — there's no file upload service yet.
          attachment: form.file ? { name: form.file.name } : null,
        },
      });
      navigate(`/debit-notes/${note.id}`, { state: { justIssued: true } });
    } catch (err) {
      // Server rule failures (e.g. an over-budget note without a reason) come back readable.
      setSaveError(err.message || 'Could not issue the debit note.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const backTo = searchParams.get('line') ? `/outflow-budget/${searchParams.get('line')}` : '/debit-notes';
  const mastersFailed =
    paymentModesQuery.isError || groupsQuery.isError || bankDetailsQuery.isError || donorsQuery.isError || employeesQuery.isError || vendorsQuery.isError;

  return (
    <Box>
      <PageHeader
        title="New Debit Note"
        subtitle="Record a debit (out) payment against an outflow budget line. It is added to that line's Spent."
        actions={
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(backTo)}>
            {searchParams.get('line') ? `Back to ${searchParams.get('line')}` : 'Back to List'}
          </Button>
        }
      />

      {mastersFailed ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Could not load employees, vendors, donors, payment modes, groups or bank accounts from the server. Check the connection and reload this page.
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
          color="primary"
          number="01"
          icon={CalendarMonthOutlinedIcon}
          title="Date & Book"
          description="When the payment went out, and which book it's recorded in."
        >
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              required
              type="date"
              label="Date"
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
          color="primary"
          number="02"
          icon={AccountBalanceWalletOutlinedIcon}
          title="Budget Line & Amount"
          description="The outflow line this payment is charged to, and how much went out."
        >
          <Grid size={{ xs: 12, md: 8 }}>
            <Autocomplete
              options={lines}
              value={form.line}
              onChange={(_, line) => handleLineChange(line)}
              getOptionLabel={(l) => `${l.budgetCode} · ${l.lineCode} · Q${l.quarter} — ${l.line}`}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              renderOption={({ key, ...props }, l) => {
                const left = rowRemaining(l, debitTotals);
                return (
                  <Box component="li" key={key} {...props} sx={{ display: 'flex', gap: 1.5 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        <Box component="span" sx={{ fontFamily: 'monospace', mr: 1 }}>
                          {l.budgetCode} · {l.lineCode} · Q{l.quarter}
                        </Box>
                        {l.line}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {l.scope} · {l.categoryName} · {l.book} · due {formatDate(l.expectedDate)}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ ...MONEY_SX, flexShrink: 0, fontWeight: 600, color: left < 0 ? 'error.main' : 'text.secondary' }}>
                      {left < 0 ? `−${formatInrExact(-left)} over` : `${formatInrExact(left)} left`}
                    </Typography>
                  </Box>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Outflow line"
                  required
                  placeholder="Search by line ID or description"
                  error={Boolean(show('line'))}
                  helperText={show('line') || ' '}
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              required
              type="number"
              label="Amount"
              value={form.amount}
              onChange={set('amount')}
              onBlur={touch('amount')}
              error={Boolean(show('amount'))}
              helperText={show('amount') || ' '}
              slotProps={{
                htmlInput: { min: 0, step: 'any' },
                input: { startAdornment: <InputAdornment position="start">₹</InputAdornment> },
              }}
            />
          </Grid>
          {isOverBudget ? (
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                select
                fullWidth
                required
                label="Over-budget reason"
                value={form.reason}
                onChange={set('reason')}
                error={Boolean(show('reason'))}
                helperText={show('reason') || 'This note takes the line over budget'}
                slotProps={{ formHelperText: { sx: { color: show('reason') ? undefined : 'warning.main' } } }}
              >
                {Object.entries(DEBIT_NOTE_REASON).map(([code, label]) => (
                  <MenuItem key={code} value={code}>{label}</MenuItem>
                ))}
              </TextField>
            </Grid>
          ) : null}
          {form.line ? (
            <Grid size={12}>
              <BudgetStrip line={form.line} spentBefore={spentNow} thisNote={thisNote} remainingAfter={remainingAfter} />
            </Grid>
          ) : null}
        </FormSection>

        <FormSection color="primary" number="03" icon={PersonOutlineIcon} title="Party" description="Who the money was paid to.">
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <SearchableSelect
              label="Payee category *"
              options={PAYEE_CATEGORIES}
              value={PAYEE_CATEGORIES.find((o) => o.value === form.payeeCategory) || null}
              onChange={handleCategoryChange}
              error={show('payeeCategory')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 8 }}>
            <SearchableSelect
              label="Payee *"
              options={payeeOptions}
              value={payeeOptions.find((o) => o.value === form.payeeId) || null}
              onChange={(opt) => setValue('payeeId', opt?.value || '')}
              loading={payeeQuery.isLoading}
              disabled={!form.payeeCategory || (!payeeQuery.isLoading && payeeOptions.length === 0)}
              placeholder={
                !form.payeeCategory
                  ? 'Select a category first'
                  : !payeeQuery.isLoading && payeeOptions.length === 0
                    ? `No active ${payeeNoun}`
                    : undefined
              }
              error={show('payeeId')}
            />
            {form.payeeCategory && payeeQuery.isSuccess && payeeOptions.length === 0 ? (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: -1 }}>
                {form.payeeCategory === 'EMPLOYEE'
                  ? 'No active employees — add or reactivate them in the Employee Master.'
                  : 'No active vendors — add or activate them in the Vendor Register.'}
              </Typography>
            ) : null}
          </Grid>
        </FormSection>

        <FormSection color="primary" number="04" icon={PaymentsOutlinedIcon} title="Payment Details" description="How it was paid and which ledger it books to.">
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <SearchableSelect
              label="Payment mode *"
              options={paymentModeOptions}
              value={paymentModeOptions.find((o) => o.value === form.paymentModeId) || null}
              onChange={(opt) => setValue('paymentModeId', opt?.value || '')}
              loading={paymentModesQuery.isLoading}
              error={show('paymentModeId')}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <SearchableSelect
              label="Bank account"
              options={bankAccountOptions}
              value={bankAccountOptions.find((o) => o.value === form.bankAccountId) || null}
              onChange={(opt) => setValue('bankAccountId', opt?.value || '')}
              loading={bankDetailsQuery.isLoading}
              disabled={!bankDetailsQuery.isLoading && bankAccountOptions.length === 0}
              placeholder={!bankDetailsQuery.isLoading && bankAccountOptions.length === 0 ? `No active ${form.book} accounts` : undefined}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              label="Reference no."
              placeholder="Bill no. / UTR / Cheque no."
              value={form.reference}
              onChange={set('reference')}
              helperText=" "
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <SearchableSelect
              label="Group / payment group *"
              options={groupOptions}
              value={groupOptions.find((o) => o.value === form.groupId) || null}
              onChange={handleGroupChange}
              loading={groupsQuery.isLoading}
              error={show('groupId')}
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
          color="primary"
          number="05"
          icon={VolunteerActivismOutlinedIcon}
          title="Fund & Grant"
          description="Optional — charge the payment to the donor fund it came from."
        >
          <Grid size={12}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<AutoAwesomeOutlinedIcon />}
                onClick={() => setSuggestOpen(true)}
                disabled={!form.line}
                sx={{ fontWeight: 700, flexShrink: 0 }}
              >
                Suggest fund
              </Button>
              <Typography variant="caption" color="text.secondary">
                {form.line
                  ? 'See the 10 donor funds best suited to this line — by programme, state, grant and available balance — and pick one.'
                  : 'Select the outflow line first to get fund suggestions.'}
              </Typography>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
            {!donorsQuery.isLoading && !donorsQuery.isError && donorOptions.length === 0 ? (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: -1 }}>
                {donors.length === 0
                  ? 'No donors found — add them in Donors Registry.'
                  : `No ${form.book} donors — change the Book above, or set this donor's book in Donors Registry.`}
              </Typography>
            ) : null}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
            {form.donorId && fundProfilesQuery.isSuccess && fundOptions.length === 0 ? (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: -1 }}>
                This donor has no fund profiles — add one from the donor&apos;s page.
              </Typography>
            ) : (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: -1, ...MONEY_SX }}>
                {!grantBalance
                  ? 'Select a fund to see its available balance'
                  : inflowLinesQuery.isLoading
                    ? 'Loading balance…'
                    : inflowLinesQuery.isError
                      ? 'Balance not available for this fund profile'
                      : `Available: ${formatInrExact(grantBalance.available)}${thisNote ? ` → after this debit: ${formatInrExact(grantBalance.available - thisNote)}` : ''}`}
              </Typography>
            )}
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
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
          {grantBalance ? (
            <Grid size={12}>
              <FundBalanceStrip
                balance={grantBalance}
                thisNote={thisNote}
                loading={inflowLinesQuery.isLoading || (Boolean(form.fundId) && grantQuery.isLoading)}
                failed={inflowLinesQuery.isError}
              />
            </Grid>
          ) : null}
        </FormSection>

        <FundSuggestionDialog
          open={suggestOpen}
          onClose={() => setSuggestOpen(false)}
          onSelect={handleSuggestionSelect}
          line={form.line}
          amount={thisNote}
          date={form.date}
          book={form.book}
          currentFundId={form.fundId || null}
        />

        <FormSection
          color="primary"
          number="06"
          icon={DescriptionOutlinedIcon}
          title="Notes & Attachment"
          description={`Optional remarks and the supporting bill (PDF, JPG or PNG, up to ${MAX_MB} MB).`}
        >
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField fullWidth multiline minRows={1} maxRows={4} label="Remarks" value={form.remarks} onChange={set('remarks')} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', alignItems: 'center' }}>
            <Stack spacing={0.5} sx={{ width: '100%' }}>
              {form.file ? (
                // Attached: a plain chip, so clicking × only removes the file (no picker).
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
                  label="Attach bill / receipt"
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
              Debit note total{' '}
              <Box component="span" sx={{ ...MONEY_SX, fontWeight: 700, color: 'error.main', fontSize: 16 }}>
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
            size="large"
            startIcon={<SaveIcon />}
            disabled={createNote.isPending}
            sx={{ px: 4, fontWeight: 700, borderRadius: 2 }}
          >
            {createNote.isPending ? 'Issuing…' : 'Issue Debit Note'}
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
