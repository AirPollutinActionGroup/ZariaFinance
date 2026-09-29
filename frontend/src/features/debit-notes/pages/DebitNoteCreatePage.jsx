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
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../core/auth/index.js';
import { PageHeader, StatusChip } from '../../../shared/components/index.js';
import { SearchableSelect } from '../../../components/SearchableSelect.jsx';
import { formatInrExact } from '../../../lib/format/currency.js';
import { getOutflowRows } from '../../outflow-budget/data/outflowRepository.js';
import { rowRemaining, rowSpent } from '../../outflow-budget/lib/spent.js';
import { FUNDING_SOURCE_TONE, FUNDING_SOURCE_TYPE } from '../../outflow-budget/constants.js';
import { usePaymentModes } from '../../payment-mode/hooks/usePaymentModes.js';
import { usePaymentTypeGroups } from '../../payment-type/hooks/usePaymentTypeGroups.js';
import { usePaymentTypeLedgers } from '../../payment-type/hooks/usePaymentTypeLedgers.js';
import { useBankDetails } from '../../bank-details/hooks/useBankDetails.js';
import { useDonors } from '../../donor-management/hooks/useDonors.js';
import { useFundProfilesByDonor } from '../../donor-management/hooks/useFundProfiles.js';
import { useGrantByFundProfileId } from '../../donor-management/hooks/useGrants.js';
import { donorBook } from '../../donor-management/lib/donorBook.js';
import { useInflowBudgetLines } from '../../inflow-budget/hooks/useInflowBudget.js';
import { useTransactions } from '../../new-transaction/hooks/useTransactions.js';
import { computeGrantBalance } from '../lib/grantBalance.js';
import { BOOKS, PAYEE_CATEGORIES, PAYEES } from '../../new-transaction/data/mockNewTransaction.js';
import { createDebitNote, debitTotalsByLine, getDebitNotes } from '../data/debitNoteRepository.js';
import { creditTotalsByLine, getCreditNotes } from '../../credit-notes/data/creditNoteRepository.js';
import { Figure, FormSection, MONEY_SX } from '../../credit-notes/components/NoteLayout.jsx';
import { ATTACHMENT_ACCEPT, ATTACHMENT_MAX_BYTES, DEBIT_NOTE_REASON } from '../constants.js';

const MAX_MB = ATTACHMENT_MAX_BYTES / (1024 * 1024);
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
  return opt ? { id: opt.value, name: opt.label } : null;
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
            <Figure label="Credited back" value={balance.credited ? `+ ${money(balance.credited)}` : money(0)} color={balance.credited ? 'success.main' : undefined} />
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
                  ? 'Nothing received on this fund yet — record receipts in the Payment Window.'
                  : 'This fund profile has no tranche plan and no Payment Window receipts yet.'
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
          <StatusChip label={FUNDING_SOURCE_TYPE[line.fundingSource]} tone={FUNDING_SOURCE_TONE[line.fundingSource]} />
          {line.donor ? <Typography variant="caption" color="text.secondary">{line.donor}</Typography> : null}
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
 * Raise a debit note — /debit-notes/new (optionally ?line=BL-04-02 to
 * preselect the outflow line). Party, payment mode, bank account and
 * Group ▸ Ledger use the same master data as the Payment Window (Cr).
 */
export function DebitNoteCreatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [lines] = useState(() => getOutflowRows());
  const [allNotes] = useState(() => getDebitNotes());
  const debitTotals = useMemo(() => debitTotalsByLine(allNotes), [allNotes]);
  const [allCredits] = useState(() => getCreditNotes());
  const creditTotals = useMemo(() => creditTotalsByLine(allCredits), [allCredits]);
  const [form, setForm] = useState(() => initialForm(lines.find((l) => l.id === searchParams.get('line')) || null));
  const [submitted, setSubmitted] = useState(false);
  // Fields the user has left — their errors show straight away, before submit.
  const [touched, setTouched] = useState({});
  const touch = (field) => () => setTouched((t) => (t[field] ? t : { ...t, [field]: true }));
  const [saveError, setSaveError] = useState(null);
  const [fileError, setFileError] = useState(null);

  const setValue = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const set = (field) => (e) => setValue(field, e.target.value);

  // ── Master data (server-backed, same as the Payment Window) ─────────────
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

  const payeeOptions = useMemo(
    () => PAYEES.filter((p) => p.category === form.payeeCategory).map((p) => ({ value: p.id, label: p.name })),
    [form.payeeCategory],
  );

  // ── Fund & Grant (server-backed donor-management data, as in the Payment Window) ──
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
  // Payment Window receipts on the fund — counted when the Inflow line hasn't recorded them yet.
  const transactionsQuery = useTransactions();
  const currentFundProfile = (fundProfilesQuery.data || []).find((f) => f.id === form.fundId) || null;

  const grantBalance = currentFundProfile
    ? computeGrantBalance({
        fundProfile: currentFundProfile,
        grant: assignedGrant,
        inflowLinesById,
        notes: allNotes,
        credits: allCredits,
        transactions: transactionsQuery.data || [],
      })
    : null;

  /** The outflow line names its donor as text; match it to a donor record in the line's book. */
  const matchDonorId = (line, book = line?.book) => {
    const name = (line?.donor || '').trim().toLowerCase();
    if (!name) return '';
    return donors.find((d) => donorBook(d) === book && (d.donorName || '').trim().toLowerCase() === name)?.id ?? '';
  };
  // Offered as a one-click suggestion when the line was preselected before donors loaded.
  const suggestedDonorId = !form.donorId ? matchDonorId(form.line, form.book) : '';
  const isRestrictedLine = form.line?.fundingSource === 'RESTRICTED';

  // ── Validation ──────────────────────────────────────────────────────────
  const amount = Number(form.amount);
  const spentNow = form.line ? rowSpent(form.line, debitTotals, creditTotals) : 0;
  const thisNote = amount > 0 ? amount : 0;
  const remainingAfter = form.line ? rowRemaining(form.line, debitTotals, creditTotals) - thisNote : 0;
  // Reason is only asked for when this note takes the line over budget.
  const isOverBudget = Boolean(form.line) && remainingAfter < 0;

  // Keys in on-page order — the "Still needed" summary lists them this way.
  const errors = {
    date: form.date ? null : 'Required',
    book: form.book ? null : 'Required',
    line: form.line ? null : 'Select an outflow line',
    amount: amount > 0 ? null : 'Enter an amount greater than zero',
    reason: !isOverBudget || form.reason ? null : 'Over budget — select why',
    payeeCategory: form.payeeCategory ? null : 'Required',
    payeeId: form.payeeId ? null : 'Select a payee',
    paymentModeId: form.paymentModeId ? null : 'Select a payment mode',
    groupId: form.groupId ? null : 'Select a group',
    // Restricted money must be charged to the donor fund it came from.
    donorId: !isRestrictedLine || form.donorId ? null : 'Restricted line — select the donor',
    // A fund profile belongs to a donor — can't pick one without the other.
    fundId: form.fundId
      ? null
      : isRestrictedLine
        ? 'Restricted line — select the fund profile'
        : form.donorId
          ? 'Select the fund profile for this donor'
          : null,
  };
  const isValid = Object.values(errors).every((e) => !e);
  const show = (field) => (submitted || touched[field] ? errors[field] : null);
  const missing = Object.keys(errors).filter((k) => errors[k]).map((k) => FIELD_LABELS[k]);

  // ── Handlers ────────────────────────────────────────────────────────────
  // A new line may change the Book (clearing book-bound picks) and pre-selects the line's donor if it matches.
  const handleLineChange = (line) =>
    setForm((f) => {
      const book = line?.book || f.book;
      const bookChanged = book !== f.book;
      const matchedDonor = matchDonorId(line, book);
      const donorId = matchedDonor || (bookChanged ? '' : f.donorId);
      return {
        ...f,
        line,
        book,
        bankAccountId: bookChanged ? '' : f.bankAccountId,
        donorId,
        fundId: donorId === f.donorId ? f.fundId : '',
      };
    });
  const handleBookChange = (opt) =>
    setForm((f) => ({ ...f, book: opt?.value || '', bankAccountId: '', donorId: '', fundId: '' }));
  const handleDonorChange = (opt) => setForm((f) => ({ ...f, donorId: opt?.value || '', fundId: '' }));
  const handleFundChange = (opt) => setForm((f) => ({ ...f, fundId: opt?.value || '' }));
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!isValid) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    try {
      const note = createDebitNote(
        {
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
          // Frontend-only: the file lives as a browser object URL for this session.
          attachment: form.file
            ? { name: form.file.name, size: form.file.size, type: form.file.type, url: URL.createObjectURL(form.file) }
            : null,
        },
        { by: user?.name || 'You' },
      );
      navigate(`/debit-notes/${note.id}`, { state: { justIssued: true } });
    } catch (err) {
      setSaveError(err.message);
    }
  };

  const backTo = searchParams.get('line') ? `/outflow-budget/${searchParams.get('line')}` : '/debit-notes';
  const mastersFailed = paymentModesQuery.isError || groupsQuery.isError || bankDetailsQuery.isError || donorsQuery.isError;

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
              getOptionLabel={(l) => `${l.id} — ${l.line}`}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              renderOption={({ key, ...props }, l) => {
                const left = rowRemaining(l, debitTotals, creditTotals);
                return (
                  <Box component="li" key={key} {...props} sx={{ display: 'flex', gap: 1.5 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        <Box component="span" sx={{ fontFamily: 'monospace', mr: 1 }}>{l.id}</Box>
                        {l.line}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {FUNDING_SOURCE_TYPE[l.fundingSource]}{l.donor ? ` · ${l.donor}` : ''} · {l.book}
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
              disabled={!form.payeeCategory}
              error={show('payeeId')}
            />
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
          description={
            isRestrictedLine
              ? 'Restricted line — charge the payment to the donor fund it came from.'
              : 'Optional for unrestricted and corpus lines.'
          }
        >
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <SearchableSelect
              label={isRestrictedLine ? 'Donor *' : 'Donor'}
              options={donorOptions}
              value={donorOptions.find((o) => o.value === form.donorId) || null}
              onChange={handleDonorChange}
              loading={donorsQuery.isLoading}
              disabled={!donorsQuery.isLoading && donorOptions.length === 0}
              placeholder={!donorsQuery.isLoading && donorOptions.length === 0 ? `No ${form.book} donors` : undefined}
              error={show('donorId')}
            />
            {suggestedDonorId ? (
              <Chip
                size="small"
                color="primary"
                variant="outlined"
                label={`Use line's donor: ${form.line.donor}`}
                onClick={() => handleDonorChange({ value: suggestedDonorId })}
                sx={{ mt: -1 }}
              />
            ) : null}
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
              label={isRestrictedLine || form.donorId ? 'Fund profile *' : 'Fund profile'}
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
                  : inflowLinesQuery.isLoading || transactionsQuery.isLoading
                    ? 'Loading balance…'
                    : inflowLinesQuery.isError && transactionsQuery.isError
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
                loading={inflowLinesQuery.isLoading || transactionsQuery.isLoading || (Boolean(form.fundId) && grantQuery.isLoading)}
                failed={inflowLinesQuery.isError && transactionsQuery.isError}
              />
            </Grid>
          ) : null}
        </FormSection>

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
          <Button type="submit" variant="contained" size="large" startIcon={<SaveIcon />} sx={{ px: 4, fontWeight: 700, borderRadius: 2 }}>
            Issue Debit Note
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
