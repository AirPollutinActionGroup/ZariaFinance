import { useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorState, PageHeader, StatusChip } from '../../../shared/components/index.js';
import { formatInrExact } from '../../../lib/format/currency.js';
import { formatDate } from '../../../lib/format/date.js';
import { BOOK_TONE } from '../../donation-management/constants.js';
import { getOutflowRowById } from '../data/outflowRepository.js';
import { rowCredits, rowDebits, rowSpent } from '../lib/spent.js';
import { debitTotalsByLine, getDebitNotes } from '../../debit-notes/data/debitNoteRepository.js';
import { DEBIT_NOTE_STATUS, DEBIT_NOTE_STATUS_TONE, reasonLabel } from '../../debit-notes/constants.js';
import { creditTotalsByLine, getCreditNotes } from '../../credit-notes/data/creditNoteRepository.js';
import {
  CREDIT_NOTE_STATUS,
  CREDIT_NOTE_STATUS_TONE,
  reasonLabel as creditReasonLabel,
} from '../../credit-notes/constants.js';
import { getRowStatus } from '../lib/status.js';
import { AS_AT_DATE, FUNDING_SOURCE_TONE, FUNDING_SOURCE_TYPE, PAYMENT_STATUS, PAYMENT_STATUS_TONE } from '../constants.js';

/** Label/value row in the "register" style used across donor & grant detail pages. */
function TermRow({ label, children, last = false }) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ py: 1.75, alignItems: 'center', borderBottom: last ? 'none' : '1px solid', borderColor: 'divider' }}
    >
      <Typography
        variant="caption"
        sx={{ width: { xs: 140, sm: 190 }, flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'text.secondary' }}
      >
        {label}
      </Typography>
      <Box sx={{ minWidth: 0 }}>
        {typeof children === 'string' || typeof children === 'number' ? (
          <Typography variant="body1">{children}</Typography>
        ) : (
          children
        )}
      </Box>
    </Stack>
  );
}

function SectionCard({ title, children }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h4" component="h2" sx={{ mb: 1.5 }}>
          {title}
        </Typography>
        {children}
      </CardContent>
    </Card>
  );
}

/** Single budget line / vendor payment view — /outflow-budget/:id. */
export function OutflowDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [row] = useState(() => getOutflowRowById(id));
  const [allNotes] = useState(() => getDebitNotes());
  const [allCredits] = useState(() => getCreditNotes());

  const asAt = useMemo(() => new Date(AS_AT_DATE), []);
  const status = row ? getRowStatus(row, asAt) : null;

  if (!row) {
    return (
      <>
        <Button startIcon={<ArrowBackIcon />} size="small" sx={{ mb: 2, color: 'text.secondary' }} onClick={() => navigate('/outflow-budget')}>
          Outflow Budget
        </Button>
        <ErrorState error={{ message: `No budget line found for "${id}".` }} />
      </>
    );
  }

  const isPaid = status === PAYMENT_STATUS.PAID;
  const isForeign = row.book === 'FC';
  const debitTotals = debitTotalsByLine(allNotes);
  const debits = rowDebits(row, debitTotals);
  const lineNotes = allNotes.filter((n) => n.outflowLineId === row.id);
  const creditTotals = creditTotalsByLine(allCredits);
  const credits = rowCredits(row, creditTotals);
  const lineCredits = allCredits.filter((n) => n.outflowLineId === row.id);
  const spent = rowSpent(row, debitTotals, creditTotals);

  return (
    <>
      <Button startIcon={<ArrowBackIcon />} size="small" sx={{ mb: 2, color: 'text.secondary' }} onClick={() => navigate('/outflow-budget')}>
        Outflow Budget
      </Button>

      <PageHeader
        title={row.id}
        subtitle={row.line}
        actions={<StatusChip label={status} tone={PAYMENT_STATUS_TONE[status]} />}
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Budget line">
            <TermRow label="Line">{row.line}</TermRow>
            <TermRow label="Funding source">
              <StatusChip label={FUNDING_SOURCE_TYPE[row.fundingSource]} tone={FUNDING_SOURCE_TONE[row.fundingSource]} />
            </TermRow>
            {row.donor ? <TermRow label="Donor / grant">{row.donor}</TermRow> : null}
            <TermRow label="Book">
              <StatusChip label={row.book} tone={BOOK_TONE[row.book]} />
            </TermRow>
            <TermRow label="Expected date">{formatDate(row.expectedDate)}</TermRow>
            <TermRow label="Budgeted amount">{formatInrExact(row.expectedAmount)}</TermRow>
            <TermRow label="Expected FX rate" last={!isForeign}>
              {isForeign ? row.expectedFx ?? '—' : 'N/A (LC)'}
            </TermRow>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <SectionCard title="Payment">
            {isPaid ? (
              <>
                <TermRow label="Payment date">{formatDate(row.actualDate)}</TermRow>
                <TermRow label="Amount paid">
                  <Typography variant="body1" sx={{ fontWeight: 700, color: 'error.main' }}>
                    {formatInrExact(row.actualAmount)}
                  </Typography>
                </TermRow>
                {isForeign ? <TermRow label="Actual FX rate">{row.actualFx ?? '—'}</TermRow> : null}
                <TermRow label="Payment ref / UTR">{row.paymentRef || '—'}</TermRow>
                <TermRow label="Payment voucher no.">{row.voucherNo || '—'}</TermRow>
                <TermRow label="Variance reason" last>
                  {row.varianceReason || '— (matched budgeted amount)'}
                </TermRow>
              </>
            ) : (
              <Box sx={{ py: 1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Not yet paid. Payment date, amount and reference will appear here once the payment is made.
                </Typography>
              </Box>
            )}
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <SectionCard title="Debit notes">
            {lineNotes.length ? (
              <>
                {lineNotes.map((n) => (
                  <Stack
                    key={n.id}
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    role="link"
                    tabIndex={0}
                    onClick={() => navigate(`/debit-notes/${n.id}`)}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/debit-notes/${n.id}`)}
                    sx={{
                      py: 1.25,
                      px: 1,
                      mx: -1,
                      cursor: 'pointer',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      opacity: n.status === 'CANCELLED' ? 0.6 : 1,
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, width: 110, flexShrink: 0 }}>{n.id}</Typography>
                    <Typography variant="body2" sx={{ width: 110, flexShrink: 0 }}>{formatDate(n.date)}</Typography>
                    <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }}>
                      {[reasonLabel(n.reason), n.payee?.name].filter(Boolean).join(' · ') || 'Debit note'}{n.remarks ? ` — ${n.remarks}` : ''}
                    </Typography>
                    <StatusChip label={DEBIT_NOTE_STATUS[n.status]} tone={DEBIT_NOTE_STATUS_TONE[n.status]} />
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, width: 120, textAlign: 'right', fontVariantNumeric: 'tabular-nums', textDecoration: n.status === 'CANCELLED' ? 'line-through' : 'none' }}
                    >
                      {formatInrExact(n.amount)}
                    </Typography>
                  </Stack>
                ))}
              </>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                No debit notes against this line.
              </Typography>
            )}
            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
              <Button size="small" variant="outlined" onClick={() => navigate(`/debit-notes/new?line=${row.id}`)}>
                Add debit note
              </Button>
              <Button size="small" onClick={() => navigate('/debit-notes')}>
                Go to Debit Notes
              </Button>
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <SectionCard title="Credit notes">
            {lineCredits.length ? (
              lineCredits.map((n) => (
                <Stack
                  key={n.id}
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  role="link"
                  tabIndex={0}
                  onClick={() => navigate(`/credit-notes/${n.id}`)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/credit-notes/${n.id}`)}
                  sx={{
                    py: 1.25,
                    px: 1,
                    mx: -1,
                    cursor: 'pointer',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    opacity: n.status === 'CANCELLED' ? 0.6 : 1,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 700, width: 110, flexShrink: 0 }}>{n.id}</Typography>
                  <Typography variant="body2" sx={{ width: 110, flexShrink: 0 }}>{formatDate(n.date)}</Typography>
                  <Typography variant="body2" sx={{ flex: 1, minWidth: 0 }}>
                    {[creditReasonLabel(n.reason), n.debitNoteId ? `reverses ${n.debitNoteId}` : '', n.payee?.name].filter(Boolean).join(' · ')}
                    {n.remarks ? ` — ${n.remarks}` : ''}
                  </Typography>
                  <StatusChip label={CREDIT_NOTE_STATUS[n.status]} tone={CREDIT_NOTE_STATUS_TONE[n.status]} />
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      width: 120,
                      textAlign: 'right',
                      fontVariantNumeric: 'tabular-nums',
                      color: n.status === 'CANCELLED' ? 'text.secondary' : 'success.main',
                      textDecoration: n.status === 'CANCELLED' ? 'line-through' : 'none',
                    }}
                  >
                    − {formatInrExact(n.amount)}
                  </Typography>
                </Stack>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                No credit notes against this line.
              </Typography>
            )}
            {lineNotes.length || lineCredits.length ? (
              <Stack direction="row" justifyContent="space-between" sx={{ pt: 1.75 }}>
                <Typography variant="body2" color="text.secondary">
                  Total spent = payment {formatInrExact(row.actualAmount || 0)} + debit notes {formatInrExact(debits)} − credit notes{' '}
                  {formatInrExact(credits)}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, color: 'error.main', fontVariantNumeric: 'tabular-nums' }}>
                  {formatInrExact(spent)}
                </Typography>
              </Stack>
            ) : null}
            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
              <Button size="small" onClick={() => navigate('/credit-notes')}>
                Go to Credit Notes
              </Button>
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>
    </>
  );
}
