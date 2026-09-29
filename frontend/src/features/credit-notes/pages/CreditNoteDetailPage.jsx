import { useMemo, useState } from 'react';
import { Alert, Box, Button, Card, GlobalStyles, Grid, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
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
import { getDebitNoteById, getDebitNotes } from '../../debit-notes/data/debitNoteRepository.js';
import { computeGrantBalance } from '../../debit-notes/lib/grantBalance.js';
import { cancelCreditNote, getCreditNoteById, getCreditNotes } from '../data/creditNoteRepository.js';
import { CancelCreditNoteDialog } from '../components/CancelCreditNoteDialog.jsx';
import { Fact, Figure, MONEY_SX, Panel, TermRow } from '../components/NoteLayout.jsx';
import { CREDIT_NOTE_STATUS, CREDIT_NOTE_STATUS_TONE, reasonLabel } from '../constants.js';

const payeeCategoryLabel = (code) => PAYEE_CATEGORIES.find((c) => c.value === code)?.label || '';
const signedInr = (v) => (v < 0 ? `−${formatInrExact(-v)}` : formatInrExact(v));
const disbursementTone = (type) => (type === 'Tranches' ? 'info' : 'neutral');

/** On print, hide the app chrome and show only the formatted credit note. */
const PRINT_STYLES = {
  '.cn-print': { display: 'none' },
  '@media print': {
    'body *': { visibility: 'hidden' },
    '.cn-print, .cn-print *': { visibility: 'visible' },
    '.cn-print': { display: 'block', position: 'fixed', top: 0, left: 0, width: '100%', padding: '24px', background: '#fff', color: '#000' },
  },
};

/** Headline: the amount, where it went, and the key facts at a glance. */
function SummaryBanner({ note, isCancelled }) {
  return (
    <Card
      variant="outlined"
      sx={{
        mb: 3,
        borderRadius: 3,
        overflow: 'hidden',
        borderColor: isCancelled ? 'divider' : 'success.main',
        borderLeftWidth: 4,
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} divider={<Box sx={{ borderLeft: { md: '1px solid' }, borderTop: { xs: '1px solid', md: 'none' }, borderColor: 'divider' }} />}>
        <Box sx={{ p: { xs: 2.5, sm: 3 }, minWidth: { md: 300 }, bgcolor: isCancelled ? 'transparent' : 'var(--ok-bg)' }}>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: 10.5 }}>
            Amount received
          </Typography>
          <Typography
            sx={{
              ...MONEY_SX,
              fontSize: { xs: 30, sm: 36 },
              fontWeight: 800,
              lineHeight: 1.15,
              mt: 0.5,
              color: isCancelled ? 'text.secondary' : 'success.main',
              textDecoration: isCancelled ? 'line-through' : 'none',
            }}
          >
            {formatInrExact(note.amount)}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            {note.fundProfile ? (
              <>
                Returned to <b>{note.fundProfile.name}</b>
                {note.donor ? ` · ${note.donor.name}` : ''}
              </>
            ) : (
              'Not returned to a donor fund'
            )}
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
          <Fact label="Date received">{formatDate(note.date)}</Fact>
          <Fact label="Book">
            {note.book ? <StatusChip label={BOOK[note.book] ? `${note.book} · ${BOOK[note.book]}` : note.book} tone={BOOK_TONE[note.book]} /> : '—'}
          </Fact>
          <Fact label="Disbursement">
            {note.disbursementType ? (
              <Box>
                <StatusChip label={note.disbursementType} tone={disbursementTone(note.disbursementType)} />
                {note.tranche ? (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }} noWrap title={note.tranche.name}>
                    {note.tranche.name}
                  </Typography>
                ) : null}
              </Box>
            ) : (
              '—'
            )}
          </Fact>
          <Fact label="Received via">{[note.paymentMode?.name, note.bankAccount?.name].filter(Boolean).join(' · ') || '—'}</Fact>
        </Box>
      </Stack>
    </Card>
  );
}

/** Where the fund stands now, with this note's share called out. */
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
          : `Includes this note's ${formatInrExact(note.amount)}.`}
      </Typography>
    </Box>
  );
}

/** Issued / cancelled events as a vertical timeline, newest first. */
function Timeline({ note, isCancelled }) {
  const events = [
    ...(isCancelled
      ? [{ key: 'cancelled', label: 'Cancelled', tone: 'neutral', by: note.cancelledBy, at: note.cancelledAt, detail: note.cancelNote }]
      : []),
    { key: 'issued', label: 'Issued', tone: 'success', by: note.createdBy, at: note.createdAt, detail: `${formatInrExact(note.amount)} recorded` },
  ];
  return (
    <Box sx={{ mt: 1.5 }}>
      {events.map((e, i) => (
        <Stack key={e.key} direction="row" spacing={1.75}>
          <Stack alignItems="center" sx={{ pt: 0.5 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: e.tone === 'success' ? 'success.main' : 'text.disabled' }} />
            {i < events.length - 1 ? <Box sx={{ flex: 1, width: 2, bgcolor: 'divider', my: 0.5 }} /> : null}
          </Stack>
          <Box sx={{ pb: i < events.length - 1 ? 2 : 0, minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <StatusChip label={e.label} tone={e.tone} />
              <Typography variant="caption" color="text.secondary">{formatDateTime(e.at)}</Typography>
            </Stack>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {e.by || '—'}
              {e.detail ? <Box component="span" sx={{ color: 'text.secondary' }}> · {e.detail}</Box> : null}
            </Typography>
          </Box>
        </Stack>
      ))}
    </Box>
  );
}

/** Plain, printer-friendly credit note document — same order as the form. */
function PrintableNote({ note, line, organisation }) {
  const cell = { border: '1px solid #999', padding: '6px 10px', fontSize: 12, textAlign: 'left' };
  const row = (label, value) => (
    <tr>
      <th style={cell}>{label}</th>
      <td style={cell}>{value || '—'}</td>
    </tr>
  );
  return (
    <Box className="cn-print" sx={{ fontFamily: 'Arial, sans-serif' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', pb: 1, mb: 2 }}>
        <Box>
          <Box sx={{ fontSize: 18, fontWeight: 700 }}>{organisation || 'Organisation'}</Box>
          <Box sx={{ fontSize: 11 }}>Credit note — money received back</Box>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Box sx={{ fontSize: 20, fontWeight: 700, letterSpacing: 2 }}>CREDIT NOTE</Box>
          <Box sx={{ fontSize: 12 }}>No. {note.id}</Box>
          <Box sx={{ fontSize: 12 }}>Date {formatDate(note.date)}</Box>
          {note.status === 'CANCELLED' ? <Box sx={{ fontSize: 14, fontWeight: 700, mt: 0.5 }}>CANCELLED</Box> : null}
        </Box>
      </Box>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
        <tbody>
          {row('Book', note.book)}
          {row('Donor', note.donor?.name)}
          {row('Fund profile', note.fundProfile?.name)}
          {row('Grant agreement', note.grant?.name)}
          {row('Disbursement type', [note.disbursementType, note.tranche?.name].filter(Boolean).join(' · '))}
          {row('Received via', note.paymentMode?.name)}
          {row('Into bank account', note.bankAccount?.name)}
          {row('Reference no.', note.reference)}
          {row('Group / Ledger', [note.group?.name, note.ledger?.name].filter(Boolean).join(' ▸ '))}
          {note.payee ? row('Received from', note.payee.name) : null}
          {note.outflowLineId ? row('Budget line', `${note.outflowLineId} — ${line?.line || '—'}`) : null}
          {note.debitNoteId ? row('Against debit note', note.debitNoteId) : null}
          {note.reason ? row('Reason', reasonLabel(note.reason)) : null}
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

/** Single credit note — /credit-notes/:id. */
export function CreditNoteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [note, setNote] = useState(() => getCreditNoteById(id));
  const [cancelOpen, setCancelOpen] = useState(false);
  const location = useLocation();
  const [justIssued, setJustIssued] = useState(Boolean(location.state?.justIssued));

  // ── Live balance on the fund this note went back to (same maths as the form) ──
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
    <Button startIcon={<ArrowBackIcon />} size="small" sx={{ mb: 2, color: 'text.secondary' }} onClick={() => navigate('/credit-notes')}>
      Credit Notes
    </Button>
  );

  if (!note) {
    return (
      <>
        {back}
        <ErrorState error={{ message: `No credit note found for "${id}".` }} />
      </>
    );
  }

  const isCancelled = note.status === 'CANCELLED';
  const fundBalance = fundProfileQuery.data
    ? computeGrantBalance({
        fundProfile: fundProfileQuery.data,
        grant: grantQuery.data || null,
        inflowLinesById,
        notes: getDebitNotes(),
        credits: getCreditNotes(), // read fresh so a cancel here is reflected
        transactions: transactionsQuery.data || [],
      })
    : null;
  const balanceLoading = fundProfileId != null && (fundProfileQuery.isLoading || inflowLinesQuery.isLoading || transactionsQuery.isLoading);

  // Older notes may carry an outflow line / debit note / reason / party; new ones don't.
  const line = note.outflowLineId ? getOutflowRowById(note.outflowLineId) : null;
  const debitNote = note.debitNoteId ? getDebitNoteById(note.debitNoteId) : null;
  const hasLegacy = Boolean(note.outflowLineId || note.debitNoteId || note.reason || note.payee);

  const handleCancel = (reason) => {
    setNote(cancelCreditNote(note.id, { by: user?.name || 'You', note: reason }));
    setCancelOpen(false);
  };

  return (
    <Box sx={{ maxWidth: 1400 }}>
      <GlobalStyles styles={PRINT_STYLES} />
      {back}

      <PageHeader
        eyebrow="Credit note"
        title={note.id}
        subtitle={`Recorded by ${note.createdBy || '—'} on ${formatDate(note.createdAt)}`}
        actions={
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <StatusChip label={CREDIT_NOTE_STATUS[note.status]} tone={CREDIT_NOTE_STATUS_TONE[note.status]} />
            <Button variant="outlined" startIcon={<PrintOutlinedIcon />} onClick={() => window.print()}>
              Print
            </Button>
            {!isCancelled ? (
              <Button variant="outlined" color="error" onClick={() => setCancelOpen(true)}>
                Cancel note
              </Button>
            ) : null}
          </Stack>
        }
      />

      {justIssued && !isCancelled ? (
        <Alert severity="success" onClose={() => setJustIssued(false)} sx={{ mb: 3 }}>
          {note.id} issued — {formatInrExact(note.amount)}
          {note.fundProfile ? ` returned to ${note.fundProfile.name}` : ' recorded'}.
        </Alert>
      ) : null}

      {isCancelled ? (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Cancelled by {note.cancelledBy || '—'} on {formatDateTime(note.cancelledAt)}
          {note.cancelNote ? ` — ${note.cancelNote}` : ''}. This note no longer counts.
        </Alert>
      ) : null}

      <SummaryBanner note={note} isCancelled={isCancelled} />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Panel icon={VolunteerActivismOutlinedIcon} title="Fund & Grant">
            {note.donor || note.fundProfile ? (
              <>
                <TermRow label="Donor">{note.donor?.name || '—'}</TermRow>
                <TermRow label="Fund profile">{note.fundProfile?.name || '—'}</TermRow>
                <TermRow label="Grant agreement">{note.grant?.name || '—'}</TermRow>
                <TermRow label="Disbursement type" last={!(note.disbursementType === 'Tranches' || note.tranche)}>
                  {note.disbursementType ? <StatusChip label={note.disbursementType} tone={disbursementTone(note.disbursementType)} /> : '—'}
                </TermRow>
                {note.disbursementType === 'Tranches' || note.tranche ? (
                  <TermRow label="Tranche" last>{note.tranche?.name || '—'}</TermRow>
                ) : null}
                <FundBalancePanel balance={fundBalance} loading={balanceLoading} note={note} isCancelled={isCancelled} />
              </>
            ) : (
              <Box sx={{ py: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  This credit wasn&apos;t returned to a donor fund.
                </Typography>
              </Box>
            )}
          </Panel>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={3} sx={{ height: '100%' }}>
            <Panel icon={PaymentsOutlinedIcon} title="Receipt details">
              <TermRow label="Received via">{note.paymentMode?.name || '—'}</TermRow>
              <TermRow label="Into account">{note.bankAccount?.name || '—'}</TermRow>
              <TermRow label="Reference no.">{note.reference || '—'}</TermRow>
              <TermRow label="Group ▸ Ledger" last>
                {[note.group?.name, note.ledger?.name].filter(Boolean).join(' ▸ ') || '—'}
              </TermRow>
            </Panel>

            <Panel icon={DescriptionOutlinedIcon} title="Notes & attachment">
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
          </Stack>
        </Grid>

        {hasLegacy ? (
          <Grid size={{ xs: 12, md: 7 }}>
            <Panel icon={LinkOutlinedIcon} title="Earlier details">
              {note.payee ? (
                <TermRow label="Received from">
                  {note.payee.name}
                  {note.payeeCategory ? ` (${payeeCategoryLabel(note.payeeCategory)})` : ''}
                </TermRow>
              ) : null}
              {note.reason ? <TermRow label="Reason">{reasonLabel(note.reason)}</TermRow> : null}
              {note.outflowLineId ? (
                <TermRow label="Outflow line" last={!note.debitNoteId}>
                  {line ? (
                    <Button size="small" sx={{ textTransform: 'none', px: 0 }} onClick={() => navigate(`/outflow-budget/${line.id}`)}>
                      {line.id} — {line.line}
                    </Button>
                  ) : (
                    `${note.outflowLineId} (no longer exists)`
                  )}
                </TermRow>
              ) : null}
              {note.debitNoteId ? (
                <TermRow label="Against debit note" last>
                  {debitNote ? (
                    <Button size="small" sx={{ textTransform: 'none', px: 0, fontFamily: 'monospace' }} onClick={() => navigate(`/debit-notes/${debitNote.id}`)}>
                      {debitNote.id}
                    </Button>
                  ) : (
                    `${note.debitNoteId} (no longer exists)`
                  )}
                </TermRow>
              ) : null}
            </Panel>
          </Grid>
        ) : null}

        <Grid size={{ xs: 12, md: hasLegacy ? 5 : 12 }}>
          <Panel icon={HistoryOutlinedIcon} title="History">
            <Timeline note={note} isCancelled={isCancelled} />
          </Panel>
        </Grid>
      </Grid>

      <PrintableNote note={note} line={line} organisation={user?.organisationName} />

      <CancelCreditNoteDialog
        key={cancelOpen ? note.id : 'closed'}
        note={cancelOpen ? note : null}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
      />
    </Box>
  );
}
