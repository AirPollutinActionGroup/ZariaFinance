import { useMemo, useState } from 'react';
import { Alert, Box, Button, Card, GlobalStyles, Grid, Stack, Tooltip, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../core/auth/index.js';
import { ErrorState, PageHeader, StatusChip } from '../../../shared/components/index.js';
import { formatInrExact } from '../../../lib/format/currency.js';
import { formatDate, formatDateTime } from '../../../lib/format/date.js';
import { BOOK, BOOK_TONE } from '../../donation-management/constants.js';
import { PAYEE_CATEGORIES } from '../../new-transaction/data/mockNewTransaction.js';
import { useTransactions } from '../../new-transaction/hooks/useTransactions.js';
import { useFundProfile } from '../../donor-management/hooks/useFundProfiles.js';
import { useGrantByFundProfileId } from '../../donor-management/hooks/useGrants.js';
import { useInflowBudgetLines } from '../../inflow-budget/hooks/useInflowBudget.js';
import { getOutflowRowById } from '../../outflow-budget/data/outflowRepository.js';
import { rowCredits, rowDebits, rowRemaining, rowSpent } from '../../outflow-budget/lib/spent.js';
import { FUNDING_SOURCE_TONE, FUNDING_SOURCE_TYPE } from '../../outflow-budget/constants.js';
import { creditTotalsByLine, getCreditNotes } from '../../credit-notes/data/creditNoteRepository.js';
import { Fact, Figure, MONEY_SX, Panel, TermRow } from '../../credit-notes/components/NoteLayout.jsx';
import { cancelDebitNote, debitTotalsByLine, getDebitNoteById, getDebitNotes } from '../data/debitNoteRepository.js';
import { computeGrantBalance } from '../lib/grantBalance.js';
import { CancelDebitNoteDialog } from '../components/CancelDebitNoteDialog.jsx';
import { DEBIT_NOTE_STATUS, DEBIT_NOTE_STATUS_TONE, reasonLabel } from '../constants.js';

const payeeCategoryLabel = (code) => PAYEE_CATEGORIES.find((c) => c.value === code)?.label || '';
const signedInr = (v) => (v < 0 ? `−${formatInrExact(-v)}` : formatInrExact(v));

/** On print, hide the app chrome and show only the formatted debit note. */
const PRINT_STYLES = {
  '.dn-print': { display: 'none' },
  '@media print': {
    'body *': { visibility: 'hidden' },
    '.dn-print, .dn-print *': { visibility: 'visible' },
    '.dn-print': { display: 'block', position: 'fixed', top: 0, left: 0, width: '100%', padding: '24px', background: '#fff', color: '#000' },
  },
};

/** Headline: the amount, the line it was charged to, and the key facts at a glance. */
function SummaryBanner({ note, line, creditedBack, isCancelled }) {
  return (
    <Card
      variant="outlined"
      sx={{
        mb: 3,
        borderRadius: 3,
        overflow: 'hidden',
        borderColor: isCancelled ? 'divider' : 'error.main',
        borderLeftWidth: 4,
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} divider={<Box sx={{ borderLeft: { md: '1px solid' }, borderTop: { xs: '1px solid', md: 'none' }, borderColor: 'divider' }} />}>
        <Box sx={{ p: { xs: 2.5, sm: 3 }, minWidth: { md: 300 }, bgcolor: isCancelled ? 'transparent' : 'var(--err-bg)' }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 10.5 }}>
            Amount paid out
          </Typography>
          <Typography
            sx={{
              ...MONEY_SX,
              fontSize: { xs: 30, sm: 36 },
              fontWeight: 800,
              lineHeight: 1.15,
              mt: 0.5,
              color: isCancelled ? 'text.secondary' : 'error.main',
              textDecoration: isCancelled ? 'line-through' : 'none',
            }}
          >
            {formatInrExact(note.amount)}
          </Typography>
          {creditedBack ? (
            <Typography variant="body2" sx={{ ...MONEY_SX, color: 'success.main', mt: 0.25 }}>
              − {formatInrExact(creditedBack)} credited back · net {formatInrExact(note.amount - creditedBack)}
            </Typography>
          ) : null}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            Charged to <b>{note.outflowLineId}</b>
            {line ? ` — ${line.line}` : ''}
          </Typography>
        </Box>
        <Box
          sx={{
            p: { xs: 2.5, sm: 3 },
            flex: 1,
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' },
            gap: 2.5,
            alignContent: 'center',
          }}
        >
          <Fact label="Date">{formatDate(note.date)}</Fact>
          <Fact label="Book">
            {note.book ? <StatusChip label={BOOK[note.book] ? `${note.book} · ${BOOK[note.book]}` : note.book} tone={BOOK_TONE[note.book]} /> : '—'}
          </Fact>
          <Fact label="Budget">
            {note.reason ? <StatusChip label={`Over · ${reasonLabel(note.reason)}`} tone="warning" /> : <StatusChip label="Within budget" tone="neutral" />}
          </Fact>
          <Fact label="Paid to">{note.payee?.name || '—'}</Fact>
        </Box>
      </Stack>
    </Card>
  );
}

/** Where the outflow line stands now, with this note's share of Spent called out. */
function BudgetImpact({ line, debitTotals, creditTotals, note, isCancelled }) {
  const budget = Number(line.expectedAmount) || 0;
  const spent = rowSpent(line, debitTotals, creditTotals);
  const remaining = rowRemaining(line, debitTotals, creditTotals);
  const thisNote = isCancelled ? 0 : note.amount;
  const others = Math.max(spent - thisNote, 0);
  const scale = Math.max(budget, spent, 1);
  const pct = (v) => `${Math.max(0, (v / scale) * 100)}%`;
  const over = remaining < 0;
  const credits = rowCredits(line, creditTotals);
  return (
    <Box
      sx={{
        mt: 2,
        px: 2,
        py: 1.75,
        borderRadius: 2,
        bgcolor: over ? 'var(--warn-bg)' : 'var(--card2)',
        border: '1px solid',
        borderColor: over ? 'warning.main' : 'divider',
      }}
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(4, minmax(0, 1fr))' }, gap: 1.75 }}>
        <Figure label="Budgeted" value={formatInrExact(budget)} />
        <Figure label="Spent" value={formatInrExact(spent)} color="error.main" />
        <Figure label="This note" value={thisNote ? `+ ${formatInrExact(thisNote)}` : '—'} color={thisNote ? 'error.main' : undefined} />
        <Figure label="Remaining" strong value={signedInr(remaining)} color={over ? 'error.main' : 'success.main'} />
      </Box>
      <Box sx={{ position: 'relative', mt: 1.5, height: 6, borderRadius: 3, bgcolor: 'var(--line2)', overflow: 'hidden', display: 'flex' }}>
        <Box sx={{ width: pct(others), bgcolor: 'text.secondary', opacity: 0.5 }} />
        <Box sx={{ width: pct(Math.min(thisNote, spent)), bgcolor: 'error.main' }} />
        {over ? <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: pct(budget), width: 2, bgcolor: 'text.primary' }} /> : null}
      </Box>
      <Typography variant="caption" color={over ? 'warning.main' : 'text.secondary'} sx={{ display: 'block', mt: 0.75, ...MONEY_SX }}>
        {[
          line.actualAmount != null ? `Payment ${formatInrExact(line.actualAmount)}` : 'Not yet paid',
          `debit notes ${formatInrExact(rowDebits(line, debitTotals))}`,
          credits ? `credit notes − ${formatInrExact(credits)}` : null,
        ]
          .filter(Boolean)
          .join(' · ')}
        {isCancelled ? ' — this note is cancelled and not counted.' : over ? ' — the line is over budget.' : ''}
      </Typography>
    </Box>
  );
}

/** Where the donor fund stands now, with this note's charge called out. */
function FundBalancePanel({ balance, loading, note, isCancelled }) {
  if (loading) {
    return <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Loading fund balance…</Typography>;
  }
  if (!balance) {
    return (
      <Box sx={{ mt: 2, px: 2, py: 1.5, borderRadius: 2, bgcolor: 'var(--card2)' }}>
        <Typography variant="caption" color="text.secondary">
          {note.fundProfile?.id == null
            ? 'Live balance is shown for fund profiles picked from the Donors Registry.'
            : 'Balance not available for this fund profile.'}
        </Typography>
      </Box>
    );
  }
  const share = balance.received > 0 ? Math.min(100, Math.max(0, (balance.available / balance.received) * 100)) : 0;
  return (
    <Box sx={{ mt: 2, px: 2, py: 1.75, borderRadius: 2, bgcolor: 'var(--card2)', border: '1px solid', borderColor: 'divider' }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.75 }}>
        <Figure label="Received" value={formatInrExact(balance.received)} color="success.main" />
        <Figure label="Debited" value={balance.debited ? `− ${formatInrExact(balance.debited)}` : formatInrExact(0)} color={balance.debited ? 'error.main' : undefined} />
        <Figure label="Credited back" value={balance.credited ? `+ ${formatInrExact(balance.credited)}` : formatInrExact(0)} color={balance.credited ? 'success.main' : undefined} />
        <Figure label="Balance available" strong value={signedInr(balance.available)} color={balance.available < 0 ? 'error.main' : 'text.primary'} />
      </Box>
      {balance.received > 0 ? (
        <Box sx={{ mt: 1.5, height: 6, borderRadius: 3, bgcolor: 'var(--line2)', overflow: 'hidden' }}>
          <Box sx={{ height: '100%', width: `${share}%`, bgcolor: 'success.main', borderRadius: 3 }} />
        </Box>
      ) : null}
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
        {isCancelled
          ? 'This note is cancelled and not counted in the balance.'
          : `Includes this note's ${formatInrExact(note.amount)} debit.`}
      </Typography>
    </Box>
  );
}

const DOT_COLOR = { error: 'error.main', success: 'success.main', neutral: 'text.disabled' };

/** Issued / credited / cancelled events as a vertical timeline, newest first. */
function Timeline({ note, noteCredits, isCancelled, onOpenCredit }) {
  const events = [
    { key: 'issued', label: 'Issued', tone: 'error', by: note.createdBy, at: note.createdAt, detail: `${formatInrExact(note.amount)} added to Spent` },
    ...noteCredits.map((c) => ({
      key: c.id,
      label: c.status === 'CANCELLED' ? 'Credit cancelled' : 'Credited',
      tone: c.status === 'CANCELLED' ? 'neutral' : 'success',
      by: c.createdBy,
      at: c.createdAt,
      creditId: c.id,
      detail: `− ${formatInrExact(c.amount)}`,
    })),
    ...(isCancelled
      ? [{ key: 'cancelled', label: 'Cancelled', tone: 'neutral', by: note.cancelledBy, at: note.cancelledAt, detail: note.cancelNote }]
      : []),
  ].sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')));

  return (
    <Box sx={{ mt: 1.5 }}>
      {events.map((e, i) => (
        <Stack key={e.key} direction="row" spacing={1.75}>
          <Stack alignItems="center" sx={{ pt: 0.5 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: DOT_COLOR[e.tone] }} />
            {i < events.length - 1 ? <Box sx={{ flex: 1, width: 2, bgcolor: 'divider', my: 0.5 }} /> : null}
          </Stack>
          <Box sx={{ pb: i < events.length - 1 ? 2 : 0, minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <StatusChip label={e.label} tone={e.tone} />
              <Typography variant="caption" color="text.secondary">{formatDateTime(e.at)}</Typography>
            </Stack>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {e.creditId ? (
                <>
                  <Box
                    component="button"
                    type="button"
                    onClick={() => onOpenCredit(e.creditId)}
                    sx={{ all: 'unset', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700, color: 'primary.main', '&:hover': { textDecoration: 'underline' } }}
                  >
                    {e.creditId}
                  </Box>{' '}
                  · {e.by || '—'}
                </>
              ) : (
                e.by || '—'
              )}
              {e.detail ? <Box component="span" sx={{ color: 'text.secondary', ...MONEY_SX }}> · {e.detail}</Box> : null}
            </Typography>
          </Box>
        </Stack>
      ))}
    </Box>
  );
}

/** Plain, printer-friendly debit note document — same order as the form. */
function PrintableNote({ note, line, organisation }) {
  const cell = { border: '1px solid #999', padding: '6px 10px', fontSize: 12, textAlign: 'left' };
  const row = (label, value) => (
    <tr>
      <th style={cell}>{label}</th>
      <td style={cell}>{value || '—'}</td>
    </tr>
  );
  return (
    <Box className="dn-print" sx={{ fontFamily: 'Arial, sans-serif' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', pb: 1, mb: 2 }}>
        <Box>
          <Box sx={{ fontSize: 18, fontWeight: 700 }}>{organisation || 'Organisation'}</Box>
          <Box sx={{ fontSize: 11 }}>Outflow budget adjustment</Box>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Box sx={{ fontSize: 20, fontWeight: 700, letterSpacing: 2 }}>DEBIT NOTE</Box>
          <Box sx={{ fontSize: 12 }}>No. {note.id}</Box>
          <Box sx={{ fontSize: 12 }}>Date {formatDate(note.date)}</Box>
          {note.status === 'CANCELLED' ? <Box sx={{ fontSize: 14, fontWeight: 700, mt: 0.5 }}>CANCELLED</Box> : null}
        </Box>
      </Box>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
        <tbody>
          {row('Book', note.book || line?.book)}
          {row('Budget line', `${note.outflowLineId} — ${line?.line || '—'}`)}
          {row('Funding source', line ? `${FUNDING_SOURCE_TYPE[line.fundingSource]}${line.donor ? ` · ${line.donor}` : ''}` : '')}
          {row('Reason', reasonLabel(note.reason) || '— (within budget)')}
          {row('Payee', note.payee ? `${note.payee.name}${note.payeeCategory ? ` (${payeeCategoryLabel(note.payeeCategory)})` : ''}` : '')}
          {row('Payment mode', note.paymentMode?.name)}
          {row('Bank account', note.bankAccount?.name)}
          {row('Reference no.', note.reference)}
          {row('Group / Ledger', [note.group?.name, note.ledger?.name].filter(Boolean).join(' ▸ '))}
          {row('Donor', note.donor?.name)}
          {row('Fund profile', note.fundProfile?.name)}
          {row('Grant agreement', note.grant?.name)}
          {row('Remarks', note.remarks)}
          <tr>
            <th style={{ ...cell, fontSize: 14 }}>Amount</th>
            <td style={{ ...cell, fontSize: 14, fontWeight: 700 }}>{formatInrExact(note.amount)}</td>
          </tr>
        </tbody>
      </table>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 8, fontSize: 12 }}>
        <Box sx={{ borderTop: '1px solid #000', pt: 0.5, width: 200 }}>Prepared by: {note.createdBy || ''}</Box>
        <Box sx={{ borderTop: '1px solid #000', pt: 0.5, width: 200 }}>Approved by</Box>
      </Box>
    </Box>
  );
}

/** Single debit note — /debit-notes/:id. */
export function DebitNoteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [note, setNote] = useState(() => getDebitNoteById(id));
  const [cancelOpen, setCancelOpen] = useState(false);
  // Set by the create page so a freshly issued note gets a confirmation banner.
  const location = useLocation();
  const [justIssued, setJustIssued] = useState(Boolean(location.state?.justIssued));

  // ── Live balance on the fund this note was charged to (same maths as the form) ──
  const fundProfileId = note?.fundProfile?.id ?? undefined;
  const fundProfileQuery = useFundProfile(fundProfileId);
  const grantQuery = useGrantByFundProfileId(fundProfileId);
  const inflowLinesQuery = useInflowBudgetLines();
  const transactionsQuery = useTransactions();
  const inflowLinesById = useMemo(() => {
    const map = new Map();
    (inflowLinesQuery.data || []).forEach((l) => map.set(Number(l.id), l));
    return map;
  }, [inflowLinesQuery.data]);

  const back = (
    <Button startIcon={<ArrowBackIcon />} size="small" sx={{ mb: 2, color: 'text.secondary' }} onClick={() => navigate('/debit-notes')}>
      Debit Notes
    </Button>
  );

  if (!note) {
    return (
      <>
        {back}
        <ErrorState error={{ message: `No debit note found for "${id}".` }} />
      </>
    );
  }

  // Read fresh on every render so a cancel here is reflected in the figures.
  const line = getOutflowRowById(note.outflowLineId);
  const allDebits = getDebitNotes();
  const allCredits = getCreditNotes();
  const debitTotals = debitTotalsByLine(allDebits);
  const creditTotals = creditTotalsByLine(allCredits);
  const noteCredits = allCredits.filter((c) => c.debitNoteId === note.id);
  const creditedBack = noteCredits.filter((c) => c.status === 'ISSUED').reduce((s, c) => s + c.amount, 0);
  const isCancelled = note.status === 'CANCELLED';
  // Cancelling a debit note that's been credited would leave its credits reversing nothing.
  const cancelBlocked = creditedBack > 0;

  const fundBalance = fundProfileQuery.data
    ? computeGrantBalance({
        fundProfile: fundProfileQuery.data,
        grant: grantQuery.data || null,
        inflowLinesById,
        notes: allDebits,
        credits: allCredits,
        transactions: transactionsQuery.data || [],
      })
    : null;
  const balanceLoading = fundProfileId != null && (fundProfileQuery.isLoading || inflowLinesQuery.isLoading || transactionsQuery.isLoading);

  const handleCancel = (reason) => {
    setNote(cancelDebitNote(note.id, { by: user?.name || 'You', note: reason }));
    setCancelOpen(false);
  };

  return (
    <Box sx={{ maxWidth: 1400 }}>
      <GlobalStyles styles={PRINT_STYLES} />
      {back}

      <PageHeader
        eyebrow="Debit note"
        title={note.id}
        subtitle={`Recorded by ${note.createdBy || '—'} on ${formatDate(note.createdAt)}`}
        actions={
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <StatusChip label={DEBIT_NOTE_STATUS[note.status]} tone={DEBIT_NOTE_STATUS_TONE[note.status]} />
            <Button variant="outlined" startIcon={<PrintOutlinedIcon />} onClick={() => window.print()}>
              Print
            </Button>
            {!isCancelled ? (
              <Tooltip title={cancelBlocked ? 'Cancel its credit notes first' : ''}>
                <span>
                  <Button variant="outlined" color="error" disabled={cancelBlocked} onClick={() => setCancelOpen(true)}>
                    Cancel note
                  </Button>
                </span>
              </Tooltip>
            ) : null}
          </Stack>
        }
      />

      {justIssued && !isCancelled ? (
        <Alert severity="success" onClose={() => setJustIssued(false)} sx={{ mb: 3 }}>
          {note.id} issued — {formatInrExact(note.amount)} added to Spent on {note.outflowLineId}
          {note.fundProfile ? ` and charged to ${note.fundProfile.name}` : ''}.
        </Alert>
      ) : null}

      {isCancelled ? (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Cancelled by {note.cancelledBy || '—'} on {formatDateTime(note.cancelledAt)}
          {note.cancelNote ? ` — ${note.cancelNote}` : ''}. This note no longer counts towards Spent.
        </Alert>
      ) : null}

      <SummaryBanner note={note} line={line} creditedBack={creditedBack} isCancelled={isCancelled} />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Panel
            tone="error"
            icon={AccountBalanceWalletOutlinedIcon}
            title="Budget line"
            action={
              line ? (
                <Button size="small" onClick={() => navigate(`/outflow-budget/${line.id}`)}>
                  Open line
                </Button>
              ) : null
            }
          >
            {line ? (
              <>
                <TermRow label="Line">
                  <Typography variant="body1">
                    <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>{line.id}</Box> — {line.line}
                  </Typography>
                </TermRow>
                <TermRow label="Funding source">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <StatusChip label={FUNDING_SOURCE_TYPE[line.fundingSource]} tone={FUNDING_SOURCE_TONE[line.fundingSource]} />
                    {line.donor ? <Typography variant="body2" color="text.secondary">{line.donor}</Typography> : null}
                  </Stack>
                </TermRow>
                <TermRow label="Over-budget reason" last>{reasonLabel(note.reason) || '— (within budget)'}</TermRow>
                <BudgetImpact line={line} debitTotals={debitTotals} creditTotals={creditTotals} note={note} isCancelled={isCancelled} />
              </>
            ) : (
              <Box sx={{ py: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Outflow line {note.outflowLineId} no longer exists.
                </Typography>
              </Box>
            )}
          </Panel>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Panel tone="error" icon={PersonOutlineIcon} title="Party & payment">
            <TermRow label="Payee">
              {note.payee?.name || '—'}
              {note.payeeCategory ? (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  {payeeCategoryLabel(note.payeeCategory)}
                </Typography>
              ) : null}
            </TermRow>
            <TermRow label="Payment mode">{note.paymentMode?.name || '—'}</TermRow>
            <TermRow label="Bank account">{note.bankAccount?.name || '—'}</TermRow>
            <TermRow label="Reference no.">{note.reference || '—'}</TermRow>
            <TermRow label="Group ▸ Ledger" last>
              {[note.group?.name, note.ledger?.name].filter(Boolean).join(' ▸ ') || '—'}
            </TermRow>
          </Panel>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Panel tone="error" icon={VolunteerActivismOutlinedIcon} title="Fund & Grant">
            {note.donor || note.fundProfile || note.grant ? (
              <>
                <TermRow label="Donor">{note.donor?.name || '—'}</TermRow>
                <TermRow label="Fund profile">{note.fundProfile?.name || '—'}</TermRow>
                <TermRow label="Grant agreement" last>{note.grant?.name || '—'}</TermRow>
                {note.fundProfile ? <FundBalancePanel balance={fundBalance} loading={balanceLoading} note={note} isCancelled={isCancelled} /> : null}
              </>
            ) : (
              <Box sx={{ py: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Not charged to a donor fund
                  {line && line.fundingSource !== 'RESTRICTED' ? ` (${FUNDING_SOURCE_TYPE[line.fundingSource].toLowerCase()} line)` : ''}.
                </Typography>
              </Box>
            )}
          </Panel>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Panel tone="error" icon={DescriptionOutlinedIcon} title="Notes & attachment">
            <Typography variant="body2" sx={{ mt: 0.5, color: note.remarks ? 'text.primary' : 'text.secondary', whiteSpace: 'pre-wrap' }}>
              {note.remarks || 'No remarks.'}
            </Typography>
            <Box sx={{ mt: 1.5 }}>
              {note.attachment ? (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AttachFileIcon />}
                  href={note.attachment.url || undefined}
                  disabled={!note.attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={note.attachment.name}
                  sx={{ textTransform: 'none' }}
                >
                  {note.attachment.name}
                </Button>
              ) : (
                <Typography variant="caption" color="text.secondary">No attachment.</Typography>
              )}
            </Box>
          </Panel>
        </Grid>

        <Grid size={12}>
          <Panel tone="error" icon={HistoryOutlinedIcon} title="History">
            <Timeline note={note} noteCredits={noteCredits} isCancelled={isCancelled} onOpenCredit={(cid) => navigate(`/credit-notes/${cid}`)} />
          </Panel>
        </Grid>
      </Grid>

      <PrintableNote note={note} line={line} organisation={user?.organisationName} />

      <CancelDebitNoteDialog
        key={cancelOpen ? note.id : 'closed'}
        note={cancelOpen ? note : null}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
      />
    </Box>
  );
}
